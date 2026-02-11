import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { generateRecommendations } from "@/lib/recommendations";
import type { ParsedCSVRow } from "@/lib/csv-parser";
import { modelCategories } from "@/lib/model-catalog";

// Add this function before line 67
function mapToUsageRow(parsed: ParsedCSVRow): any {
  return {
    model: parsed.model,
    tokens_used: parsed.inputTokens + parsed.outputTokens + parsed.thinkingTokens,
    cost: parsed.totalCost,
    timestamp: parsed.timestamp || new Date().toISOString(),
    line_item: `${parsed.model}:${parsed.inputTokens}+${parsed.outputTokens}`,
    amount_value: parsed.totalCost,
    amount_currency: 'USD'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { uploadId } = await req.json();
    console.log('Received CSV data sample:', uploadId);
    
    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId" },
        { status: 400 }
      );
    }

    const sb = createServerSupabase();
    const { data: upload, error: fetchError } = await sb
      .from("csv_uploads")
      .select("raw_data, status")
      .eq("id", uploadId)
      .single();

    if (fetchError || !upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    const rawData = upload.raw_data as ParsedCSVRow[];
    if (!Array.isArray(rawData)) {
      return NextResponse.json(
        { error: "Invalid upload data" },
        { status: 400 }
      );
    }

    // Validate CSV data
    if (rawData.length === 0) {
      return NextResponse.json(
        { error: "CSV file appears to be empty or contains no valid data" },
        { status: 400 }
      );
    }

    // Check for rows with missing critical data
    const validRows = rawData.filter(row => 
      row.model && 
      typeof row.cost === 'number' && 
      typeof row.tokens_used === 'number' &&
      row.cost > 0
    );

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No valid cost data found in CSV. Please ensure your file contains cost information." },
        { status: 400 }
      );
    }

    // Log any invalid rows for debugging
    const invalidRows = rawData.length - validRows.length;
    if (invalidRows > 0) {
      console.warn(`Warning: ${invalidRows} rows had invalid or missing cost data and were skipped`);
    }

    // Debug logs for parsed models
    console.log('Parsed models:', validRows.map(r => ({ 
      model: r.model, 
      displayName: r.displayName,
      cost: r.totalCost 
    })));

    // Check if this is a free or paid analysis
    const { data: uploadData } = await sb
      .from('csv_uploads')
      .select('stripe_checkout_id')
      .eq('id', uploadId)
      .single()

    const isPaid = !!uploadData?.stripe_checkout_id

    const recommendations = generateRecommendations(validRows.map(mapToUsageRow));
    const totalSpend = validRows.reduce((acc, r) => acc + r.cost, 0);
    const totalRequests = validRows.length;
    const modelCosts: Record<string, { cost: number; tokens: number }> = {};
    validRows.forEach((r) => {
      if (!modelCosts[r.model]) {
        modelCosts[r.model] = { cost: 0, tokens: 0 };
      }
      modelCosts[r.model].cost += r.cost;
      modelCosts[r.model].tokens += r.tokens_used;
    });
    const topModels = Object.entries(modelCosts)
      .map(([model, data]) => ({ 
        model, 
        cost: data.cost, 
        tokens: data.tokens,
        displayName: modelCategories[model]?.displayName || model
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    // Calculate potential savings (show vague amount for free tier)
    const totalSavings = totalSpend * 0.4; // Example calculation
    const potentialSavings = isPaid ? totalSavings : Math.round(totalSavings * 0.3);

    await sb.from("csv_uploads").update({ status: "analyzing" }).eq("id", uploadId);
    const { error: insertError } = await sb.from("analysis_results").upsert(
      {
        upload_id: uploadId,
        total_spend: totalSpend,
        total_requests: totalRequests,
        top_models: topModels,
        recommendations,
      },
      { onConflict: "upload_id" }
    );
    await sb.from("csv_uploads").update({ status: "completed" }).eq("id", uploadId);

    if (insertError) {
      console.error(insertError);
      return NextResponse.json(
        { error: "Analysis failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalSpend,
      totalRequests,
      topModels,
      recommendations,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
