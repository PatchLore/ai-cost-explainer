import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseOpenAICSV } from "@/lib/csv-parser";
import { generateRecommendations } from "@/lib/recommendations";
import { uploadRateLimit, getClientIp } from "@/lib/ratelimit";

function computeSpendByDay(
  rawData: { timestamp: string; cost: number }[]
): { date: string; cost: number }[] {
  const byDay: Record<string, number> = {};
  rawData.forEach((r) => {
    const date = r.timestamp.slice(0, 10); // YYYY-MM-DD
    byDay[date] = (byDay[date] ?? 0) + r.cost;
  });
  return Object.entries(byDay)
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function POST(req: NextRequest) {
  try {
    if (uploadRateLimit) {
      const ip = getClientIp(req);
      const { success } = await uploadRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many uploads. Please try again in a minute." },
          { status: 429 }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File must be 10MB or smaller." },
        { status: 413 }
      );
    }

    const supabaseAuth = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read file as text and parse
    const csvText = await file.text();
    const rawData = parseOpenAICSV(csvText);
    const recommendations = generateRecommendations(rawData);
    const spendByDay = computeSpendByDay(rawData);

    const totalSpend = rawData.reduce((acc, r) => acc + r.cost, 0);
    const totalRequests = rawData.length;
    const modelCosts: Record<string, { cost: number; tokens: number }> = {};
    rawData.forEach((r) => {
      if (!modelCosts[r.model]) {
        modelCosts[r.model] = { cost: 0, tokens: 0 };
      }
      modelCosts[r.model].cost += r.cost;
      modelCosts[r.model].tokens += r.tokens_used;
    });
    const topModels = Object.entries(modelCosts)
      .map(([model, data]) => ({ model, cost: data.cost, tokens: data.tokens }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    const sb = createServerSupabase();

    const analysisData = {
      recommendations,
      spend_by_day: spendByDay,
      total_spend: totalSpend,
      total_requests: totalRequests,
      top_models: topModels,
    };

    // Upload to storage first. If storage fails, abort early and return error.
    const arrayBuffer = await file.arrayBuffer();
    const storagePath = `${userId}/${Date.now()}-${file.name}`;
    const { data: storageData, error: storageError } = await sb.storage
      .from("csv-uploads")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || "text/csv",
        upsert: true,
      });

    if (storageError) {
      console.error("STORAGE UPLOAD ERROR:", storageError);
      const storageMessage = (storageError as any).message ?? String(storageError);
      return NextResponse.json(
        { error: "Storage upload failed", details: storageMessage },
        { status: 500 }
      );
    }

    // storageData.path should contain the uploaded file path; fall back to our path if absent
    const finalStoragePath = (storageData && (storageData as any).path) || storagePath;

    // Now insert the DB row with the confirmed storage path
    const { data: upload, error: uploadError } = await sb
      .from("csv_uploads")
      .insert({
        user_id: userId,
        filename: file.name,
        storage_path: finalStoragePath,
        file_size: file.size,
        content_type: file.type || "text/csv",
        original_name: file.name,
        analysis_data: analysisData,
        concierge_status: "pending",
        stripe_checkout_id: null,
      })
      .select("id")
      .single();

    if (uploadError) {
      console.error("UPLOAD INSERT ERROR:", uploadError);
      const message = (uploadError as any).message ?? String(uploadError);
      return NextResponse.json(
        { error: message, details: uploadError },
        { status: 500 }
      );
    }

    const { error: analysisError } = await sb.from("analysis_results").insert({
      upload_id: upload.id,
      total_spend: totalSpend,
      total_requests: totalRequests,
      top_models: topModels,
      recommendations,
      spend_by_day: spendByDay,
    });

    if (analysisError) {
      console.error(analysisError);
    }

    return NextResponse.json({ uploadId: upload.id });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
