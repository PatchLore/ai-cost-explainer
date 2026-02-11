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

export function calculateEfficiencyScore(analysisData: { rows: ParsedCSVRow[] }) {
  let totalSpend = 0;
  let legacySpend = 0;
  let thinkingWaste = 0;
  let optimizedSpend = 0;
  
  analysisData.rows.forEach((row: ParsedCSVRow) => {
    totalSpend += row.totalCost;
    
    // Legacy tax detection
    const model = modelCategories[row.model as keyof typeof modelCategories];
    if (model && 'isLegacy' in model && model.isLegacy) {
      legacySpend += row.totalCost * model.legacyTax;
    }
    
    // Thinking waste detection
    if (row.isReasoningModel && row.thinkingTokens > 0) {
      // If thinking > threshold x output, it's probably overkill
      if (model && 'thinkingAlertThreshold' in model && model.thinkingAlertThreshold && row.thinkingTokens > (row.outputTokens * model.thinkingAlertThreshold)) {
        thinkingWaste += row.thinkingCost * 0.7; // 70% could be saved
      }
    }
    
    // Calculate optimized cost
    if (model?.alternative && modelCategories[model.alternative]) {
      const altModel = modelCategories[model.alternative];
      const altCost = (row.inputTokens / 1000000) * altModel.costPer1mInput + 
                      (row.outputTokens / 1000000) * altModel.costPer1mOutput;
      optimizedSpend += altCost;
    } else {
      optimizedSpend += row.totalCost;
    }
  });
  
  const potentialSavings = legacySpend + thinkingWaste + (totalSpend - optimizedSpend);
  const efficiencyScore = Math.max(0, Math.min(100, 
    100 - ((potentialSavings / totalSpend) * 100)
  ));
  
  return {
    score: Math.round(efficiencyScore),
    totalSpend,
    potentialSavings,
    legacySpend,
    thinkingWaste,
    grade: efficiencyScore > 80 ? 'Excellent' : 
           efficiencyScore > 60 ? 'Needs Work' : 
           efficiencyScore > 40 ? 'Poor' : 'Critical'
  };
}