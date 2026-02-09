import { parse } from "csv-parse/sync";

export interface OpenAIUsageRow {
  model: string;
  tokens_used: number;
  cost: number;
  timestamp: string;
  request_type: string;
}

export async function parseOpenAICSV(file: File): Promise<OpenAIUsageRow[]> {
  try {
    const csvText = await file.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      cast: false, // Don't auto-cast; we'll handle type conversions manually
    }) as any[];

    const normalized = records.map((row: any) => ({
      model: String(row["Model"] ?? row["model"] ?? ""),
      tokens_used: parseInt(String(row["Tokens"] ?? row["tokens_used"] ?? 0), 10),
      cost: parseFloat(String(row["Cost"] ?? row["cost"] ?? 0)),
      timestamp: String(row["Timestamp"] ?? row["timestamp"] ?? ""),
      request_type: String(row["Request Type"] ?? row["request_type"] ?? "unknown"),
    }));

    return normalized;
  } catch (err) {
    throw new Error(`Failed to parse CSV: ${err instanceof Error ? err.message : String(err)}`);
  }
}
