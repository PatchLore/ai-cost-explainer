import { parse } from 'csv-parse/sync';
import { modelCategories } from './model-catalog';

export interface ParsedCSVRow {
  model: string;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  isReasoningModel: boolean;
  totalCost: number;
  visibleCost: number;
  thinkingCost: number;
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
      console.log('prompt_tokens:', firstRow['prompt_tokens']);
      console.log('completion_tokens:', firstRow['completion_tokens']);
      console.log('reasoning_tokens:', firstRow['reasoning_tokens']);
      console.log('thinking_tokens:', firstRow['thinking_tokens']);
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

      // Parse tokens with 2026 thinking token support
      const inputTokens = parseInt(row['prompt_tokens'] || row['input_tokens'] || row['Tokens'] || row['tokens_used'] || 0);
      const outputTokens = parseInt(row['completion_tokens'] || row['output_tokens'] || 0);
      const thinkingTokens = parseInt(row['reasoning_tokens'] || row['thinking_tokens'] || 0);

      // Extract model name from line_item or model column
      const modelKey = (row['line_item'] || row['Model'] || row['model'] || '').split(':')[0].toLowerCase();
      const model = modelCategories[modelKey];

      // Calculate costs for 2026 thinking models
      let totalCost = cost;
      let visibleCost = cost;
      let thinkingCost = 0;
      let isReasoningModel = false;

      if (model) {
        isReasoningModel = model.hasThinking;
        
        // Calculate true cost including thinking tokens
        const inputCost = (inputTokens / 1000000) * model.costPer1mInput;
        const outputCost = (outputTokens / 1000000) * model.costPer1mOutput;
        const calculatedThinkingCost = model.hasThinking && thinkingTokens 
          ? (thinkingTokens / 1000000) * (model.costPer1mThinking || 0)
          : 0;

        totalCost = inputCost + outputCost + calculatedThinkingCost;
        visibleCost = inputCost + outputCost;
        thinkingCost = calculatedThinkingCost;
      }

      return {
        model: modelKey,
        inputTokens,
        outputTokens,
        thinkingTokens,
        isReasoningModel,
        totalCost,
        visibleCost,
        thinkingCost,
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
