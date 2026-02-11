import { parse } from 'csv-parse/sync';
import { modelCategories } from './model-catalog';

export interface ParsedCSVRow {
  // New 2026 fields
  model: string;
  displayName: string;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  isReasoningModel: boolean;
  inputCost: number;
  outputCost: number;
  thinkingCost: number;
  totalCost: number;
  visibleCost: number;
  
  // Backwards compatibility fields (required by existing UsageRow type)
  tokens_used: number;
  cost: number;
  timestamp: string;
  request_type: string;
  line_item?: string;
  amount_value?: number;
  amount_currency?: string;
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
      // Debug log to see what we're getting
      console.log('Parsing model:', row['model_name'], 'Available:', Object.keys(modelCategories));
      
      // Parse model name from model_name column (primary) or fallback to line_item format
      let modelKey = '';
      if (row['model_name']) {
        modelKey = (row['model_name'] || '').toLowerCase().trim();
      } else {
        // Fallback to line_item format for backwards compatibility
        modelKey = (row['line_item'] || row['Model'] || row['model'] || '').split(':')[0].toLowerCase().trim();
      }
      
      const model = modelCategories[modelKey];
      
      if (!model) {
        console.error('Unknown model key:', modelKey, 'Available models:', Object.keys(modelCategories));
        return {
          model: 'unknown',
          displayName: 'Unknown Model',
          inputTokens: 0,
          outputTokens: 0,
          thinkingTokens: 0,
          isReasoningModel: false,
          inputCost: 0,
          outputCost: 0,
          thinkingCost: 0,
          totalCost: 0,
          visibleCost: 0,
          tokens_used: 0,
          cost: 0,
          timestamp: row['Timestamp'] || row['timestamp'] || row['Time'] || row['date'] || '',
          request_type: row['Request Type'] || row['request_type'] || row['Operation'] || row['operation'] || '',
          line_item: row['line_item'] || row['Model'] || row['model'] || '',
          amount_value: 0,
          amount_currency: row['amount_currency'] || 'USD',
          ...row
        };
      }

      // Parse cost from multiple possible column names
      const cost = parseFloat(
        row['amount_value'] || 
        row['Cost'] || 
        row['cost'] || 
        row['Total Cost'] || 
        row['total_cost'] || 
        0
      ) || 0;

      // Parse tokens from CSV columns (not from line_item string)
      const inputTokens = parseInt(row['prompt_tokens'] || row['input_tokens'] || row['Tokens'] || row['tokens_used'] || 0);
      const outputTokens = parseInt(row['completion_tokens'] || row['output_tokens'] || 0);
      const thinkingTokens = parseInt(row['reasoning_tokens'] || row['thinking_tokens'] || 0);

      // Calculate costs using model catalog rates
      const inputCost = (inputTokens / 1000000) * model.costPer1mInput;
      const outputCost = (outputTokens / 1000000) * model.costPer1mOutput;
      const calculatedThinkingCost = model.hasThinking && thinkingTokens 
        ? (thinkingTokens / 1000000) * (model.costPer1mThinking || 0)
        : 0;

      const totalCost = inputCost + outputCost + calculatedThinkingCost;
      const visibleCost = inputCost + outputCost;
      const isReasoningModel = model.hasThinking;

      return {
        // New 2026 fields
        model: modelKey,
        displayName: model.displayName || modelKey,
        inputTokens,
        outputTokens,
        thinkingTokens,
        isReasoningModel,
        inputCost,
        outputCost,
        thinkingCost: calculatedThinkingCost,
        totalCost,
        visibleCost,
        
        // Backwards compatibility fields (required by existing UsageRow type)
        tokens_used: inputTokens + outputTokens + thinkingTokens,
        cost: totalCost,
        timestamp: row['Timestamp'] || row['timestamp'] || row['Time'] || row['date'] || '',
        request_type: row['Request Type'] || row['request_type'] || row['Operation'] || row['operation'] || '',
        line_item: row['line_item'] || row['Model'] || row['model'] || '',
        amount_value: totalCost,
        amount_currency: row['amount_currency'] || 'USD',
        
        // Keep raw data too
        ...row
      };
    });
  } catch (error) {
    console.error('CSV Parse Error:', error);
    throw new Error('Failed to parse CSV file. Please ensure it is a valid OpenAI usage export.');
  }
}
