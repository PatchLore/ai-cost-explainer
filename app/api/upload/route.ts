import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseOpenAICSV } from "@/lib/csv-parser";
import { generateRecommendations } from "@/lib/recommendations";

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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing file or userId" },
        { status: 400 }
      );
    }

    const supabaseAuth = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawData = await parseOpenAICSV(file);
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

    const { data: upload, error: uploadError } = await sb
      .from("csv_uploads")
      .insert({
        user_id: userId,
        filename: file.name,
        storage_path: null,
        file_size: file.size,
        provider: "openai",
        status: "completed",
        raw_data: rawData,
      })
      .select("id")
      .single();

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: "Failed to save upload" },
        { status: 500 }
      );
    }

    const storagePath = `${userId}/${upload.id}/${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: storageError } = await sb.storage
      .from("csv-uploads")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || "text/csv",
        upsert: true,
      });

    if (!storageError) {
      await sb
        .from("csv_uploads")
        .update({ storage_path: storagePath })
        .eq("id", upload.id);
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
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
