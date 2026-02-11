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

    // Debug: Log first row to understand column structure
    if (records.length > 0) {
      const firstRow = records[0] as Record<string, any>;
      console.log('CSV Parser Debug - First row:', firstRow);
      console.log('Available columns:', Object.keys(firstRow));
      console.log('amount_value:', firstRow['amount_value']);
      console.log('Cost:', firstRow['Cost']);
      console.log('cost:', firstRow['cost']);
    }

    // Normalize column names (OpenAI uses different cases)
    return records.map((row: any) => {
      // Parse cost from multiple possible column names
      const cost = parseFloat(
        row['amount_value'] || 
        row['Cost'] || 
        row['cost'] || 
        row['Total Cost'] || 
        row['total_cost'] || 
        0
      ) || 0;

      return {
        model: row['Model'] || row['model'] || row['line_item'] || '',
        tokens_used: parseInt(row['Tokens'] || row['tokens_used'] || row['Total Tokens'] || row['token_usage'] || 0),
        cost: cost,
        timestamp: row['Timestamp'] || row['timestamp'] || row['Time'] || row['date'] || '',
        request_type: row['Request Type'] || row['request_type'] || row['Operation'] || row['operation'] || '',
        // Keep raw data too
        ...row
      };
    });
  } catch (error) {
    console.error('CSV Parse Error:', error);
    throw new Error('Failed to parse CSV file. Please ensure it is a valid OpenAI usage export.');
  }
}
