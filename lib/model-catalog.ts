// Define TypeScript interfaces for model categories
interface StandardModel {
  costPer1mInput: number;
  costPer1mOutput: number;
  hasThinking: false;
  category: 'standard' | 'nano';
  alternative: null;
}

interface LegacyModel {
  costPer1mInput: number;
  costPer1mOutput: number;
  hasThinking: false;
  isLegacy: true;
  legacyTax: number;
  alternative: string;
  savingsPotential: number;
}

interface ReasoningModel {
  costPer1mInput: number;
  costPer1mOutput: number;
  costPer1mThinking: number;
  hasThinking: true;
  thinkingAlertThreshold: number;
  alternative: string;
  category: 'reasoning';
}

type ModelCategory = StandardModel | LegacyModel | ReasoningModel;

export const modelCategories: Record<string, ModelCategory> = {
  // 2026 Standard Models
  'gpt-5.2': { 
    costPer1mInput: 1.75, 
    costPer1mOutput: 14.00,
    hasThinking: false,
    category: 'standard',
    alternative: null
  },
  
  'gpt-5-nano': { 
    costPer1mInput: 0.05, 
    costPer1mOutput: 0.40,
    hasThinking: false,
    category: 'nano',
    alternative: null
  },
  
  // LEGACY TAX MODELS (Critical flag)
  'gpt-4o': { 
    costPer1mInput: 2.50, 
    costPer1mOutput: 10.00,
    hasThinking: false,
    isLegacy: true,
    legacyTax: 0.40, // 40% more expensive than GPT-5.2
    alternative: 'gpt-5.2',
    savingsPotential: 0.40
  },
  
  // REASONING/THINKING MODELS (Hidden costs)
  'gpt-5-thinking': { 
    costPer1mInput: 5.00, 
    costPer1mOutput: 20.00,
    costPer1mThinking: 20.00, // Billed as output but invisible
    hasThinking: true,
    thinkingAlertThreshold: 3.0, // Flag if thinking > 3x output
    alternative: 'gpt-5.2',
    category: 'reasoning'
  },
  
  'o3': {
    costPer1mInput: 10.00,
    costPer1mOutput: 40.00,
    costPer1mThinking: 40.00,
    hasThinking: true,
    thinkingAlertThreshold: 2.0,
    alternative: 'gpt-5-thinking',
    category: 'reasoning'
  },
  
  'o1': {
    costPer1mInput: 15.00,
    costPer1mOutput: 60.00,
    costPer1mThinking: 60.00,
    hasThinking: true,
    thinkingAlertThreshold: 2.0,
    alternative: 'o3',
    category: 'reasoning'
  }
};
