import Papa from "papaparse";

export interface OpenAIUsageRow {
  model: string;
  tokens_used: number;
  cost: number;
  timestamp: string;
  request_type: string;
}

export function parseOpenAICSV(file: File): Promise<OpenAIUsageRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const normalized = results.data.map((row: Record<string, unknown>) => ({
          model: String(row["Model"] ?? row["model"] ?? ""),
          tokens_used: parseInt(String(row["Tokens"] ?? row["tokens_used"] ?? 0), 10),
          cost: parseFloat(String(row["Cost"] ?? row["cost"] ?? 0)),
          timestamp: String(row["Timestamp"] ?? row["timestamp"] ?? ""),
          request_type: String(row["Request Type"] ?? row["request_type"] ?? "unknown"),
        }));
        resolve(normalized);
      },
      error: reject,
    });
  });
}
