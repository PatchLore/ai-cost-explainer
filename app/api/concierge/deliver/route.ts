import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface CodeSnippetInput {
  title: string;
  language: string;
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      uploadId,
      loomUrl,
      report,
      savings,
      codeSnippets,
      adminEmail,
    } = await req.json();
    if (!uploadId || !loomUrl) {
      return NextResponse.json(
        { error: "Missing uploadId or loomUrl" },
        { status: 400 }
      );
    }

    if (!adminEmail || adminEmail !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sb = createServerSupabase();

    const { data: upload, error: uploadError } = await sb
      .from("csv_uploads")
      .select("user_id")
      .eq("id", uploadId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    const snippets: CodeSnippetInput[] = Array.isArray(codeSnippets)
      ? codeSnippets.filter(
          (s: unknown) =>
            s &&
            typeof s === "object" &&
            "title" in s &&
            "code" in s &&
            typeof (s as CodeSnippetInput).title === "string" &&
            typeof (s as CodeSnippetInput).code === "string"
        )
      : [];

    const { error: deliverableError } = await sb
      .from("concierge_deliverables")
      .insert({
        upload_id: uploadId,
        consultant_id: null,
        loom_video_url: loomUrl,
        written_report: report ?? null,
        code_snippets: snippets.length > 0 ? snippets : null,
        top_savings: savings != null ? Number(savings) : null,
      });

    if (deliverableError) {
      console.error(deliverableError);
      return NextResponse.json(
        { error: "Failed to save deliverable" },
        { status: 500 }
      );
    }

    await sb
      .from("csv_uploads")
      .update({
        tier: "concierge_delivered",
        loom_video_url: loomUrl,
        consultant_notes: report ?? null,
        savings_estimate: savings != null ? Number(savings) : null,
      })
      .eq("id", uploadId);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.URL ??
      "http://localhost:3000";
    const viewUrl = `${baseUrl}/dashboard/upload/${uploadId}`;

    let customerEmail: string | null = null;
    try {
      const { data: userData } = await sb.auth.admin.getUserById(
        upload.user_id
      );
      customerEmail = userData?.user?.email ?? null;
    } catch {
      // ignore
    }

    if (customerEmail && resend) {
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
        to: customerEmail,
        subject: "Your AI Cost Expert Analysis is Ready",
        html: `
          <p>Your expert analysis and implementation guide are ready.</p>
          <p><a href="${viewUrl}">View your results</a></p>
          <p>You can watch your personalized Loom video and download code snippets from the link above.</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Delivery failed" },
      { status: 500 }
    );
  }
}
