import { parse } from 'csv-parse/sync';

export interface ParsedCSVRow {
  model: string;
  tokens_used: number;
  cost: number;
  timestamp: string;
  request_type: string;
  [key: string]: any;
}

export function parseOpenAICSV(csvText: string): ParsedCSVRow[] {
  try {
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
      trim: true,
    });

    // Normalize column names (OpenAI uses different cases)
    return records.map((row: any) => ({
      model: row['Model'] || row['model'] || '',
      tokens_used: parseInt(row['Tokens'] || row['tokens_used'] || row['Total Tokens'] || 0),
      cost: parseFloat(row['Cost'] || row['cost'] || 0),
      timestamp: row['Timestamp'] || row['timestamp'] || row['Time'] || '',
      request_type: row['Request Type'] || row['request_type'] || row['Operation'] || '',
      // Keep raw data too
      ...row
    }));
  } catch (error) {
    console.error('CSV Parse Error:', error);
    throw new Error('Failed to parse CSV file. Please ensure it is a valid OpenAI usage export.');
  }
}
