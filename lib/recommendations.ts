export interface Recommendation {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  action: string;
  codeSnippet?: string;
}

interface UsageRow {
  model: string;
  tokens_used: number;
  cost: number;
  timestamp: string;
}

// PARSE LINE ITEM FOR THINKING TOKENS
const parseLineItem = (lineItem: string) => {
  // Match: model:inputTokens+outputTokens+thinkingTokens (3 parts = reasoning model)
  // Match: model:inputTokens+outputTokens (2 parts = standard model)
  
  const match = lineItem.match(/^(.*?):(\d+)\+(\d+)(?:\+(\d+))?$/);
  
  if (!match) return null;
  
  const [_, model, input, output, thinking] = match;
  
  return {
    model: model.toLowerCase(),
    inputTokens: parseInt(input),
    outputTokens: parseInt(output),
    thinkingTokens: thinking ? parseInt(thinking) : 0,
    isReasoningModel: !!thinking
  };
};

// CALCULATE TRUE COST INCLUDING THINKING
const calculateTrueCost = (parsed: any) => {
  const model = modelCategories[parsed.model as keyof typeof modelCategories];
  if (!model) return null;
  
  const inputCost = (parsed.inputTokens / 1000000) * model.costPer1mInput;
  const outputCost = (parsed.outputTokens / 1000000) * model.costPer1mOutput;
  const thinkingCost = parsed.thinkingTokens 
    ? (parsed.thinkingTokens / 1000000) * (model.costPer1mThinking || 0)
    : 0;
  
  return {
    inputCost,
    outputCost,
    thinkingCost,
    totalCost: inputCost + outputCost + thinkingCost,
    thinkingRatio: parsed.thinkingTokens / parsed.outputTokens,
    hiddenCostPercentage: thinkingCost / (inputCost + outputCost + thinkingCost)
  };
};

// AUDIT FLAGS FOR THINKING OVERKILL
const generateThinkingFlags = (parsed: any, costs: any) => {
  const flags: any[] = [];
  const model = modelCategories[parsed.model as keyof typeof modelCategories];
  
  if (!model.hasThinking) return flags;
  
  // Flag 1: Thinking ratio too high
  if (model.thinkingRatioWarning && costs.thinkingRatio > model.thinkingRatioWarning) {
    flags.push({
      severity: 'high',
      title: 'Thinking Overkill Detected',
      message: `Model spent ${costs.thinkingRatio.toFixed(1)}x more tokens "thinking" than answering. 
                This is like hiring a PhD to answer a FAQ.`,
      impact: `Thinking costs: $${costs.thinkingCost.toFixed(2)} (${(costs.hiddenCostPercentage * 100).toFixed(0)}% of total bill)`,
      action: 'Switch to gpt-5.2 for straightforward tasks. Reserve reasoning models for complex multi-step problems only.'
    });
  }
  
  // Flag 2: Simple task using reasoning model
  if (parsed.outputTokens < 500 && costs.thinkingTokens > 1000) {
    flags.push({
      severity: 'critical',
      title: 'Sledgehammer for a Nail',
      message: `Short answer (${parsed.outputTokens} tokens) required ${parsed.thinkingTokens} tokens of reasoning.`,
      impact: 'You paid for 30 seconds of "thinking" for a 2-sentence answer.',
      action: 'Route simple Q&A to gpt-5-mini. Use reasoning models only for coding, math, or multi-step logic.'
    });
  }
  
  // Flag 3: Could use gpt-5.2 instead
  if (model.cheaperAlternative && costs.thinkingCost > 0.01) {
    const potentialSavings = costs.totalCost * model.savingsPotential;
    flags.push({
      severity: 'medium',
      title: 'Downgrade Opportunity',
      message: `You're paying thinking premiums for tasks that likely don't need deep reasoning.`,
      impact: `Potential savings: $${potentialSavings.toFixed(2)}/month by switching to ${model.cheaperAlternative}`,
      action: `A/B test: Route 50% of traffic to ${model.cheaperAlternative} and compare output quality.`
    });
  }
  
  return flags;
};

// 2026 Complete Model Catalog with Reasoning/Thinking Costs
interface ModelCategory {
  costPer1mInput: number;
  costPer1mOutput: number;
  hasThinking: boolean;
  cheaperAlternative: string | null;
  savingsPotential: number;
  costPer1mThinking?: number;
  thinkingRatioWarning?: number;
  flagAsLegacy?: boolean;
}

const modelCategories: Record<string, ModelCategory> = {
  // STANDARD MODELS (No thinking costs)
  'gpt-5.2': { 
    costPer1mInput: 1.75,
    costPer1mOutput: 14.00,
    hasThinking: false,
    cheaperAlternative: 'gpt-5-mini', 
    savingsPotential: 0.80 
  },
  
  'gpt-5-mini': { 
    costPer1mInput: 0.25,
    costPer1mOutput: 1.00,
    hasThinking: false,
    cheaperAlternative: 'gpt-5-nano', 
    savingsPotential: 0.75 
  },
  
  'gpt-5-nano': {
    costPer1mInput: 0.05,
    costPer1mOutput: 0.20,
    hasThinking: false,
    cheaperAlternative: null,
    savingsPotential: 0
  },

  // REASONING MODELS (Thinking tokens = HIDDEN COST)
  'gpt-5.3-codex': { 
    costPer1mInput: 1.75,
    costPer1mOutput: 14.00,
    costPer1mThinking: 8.00, // ⚠️ THINKING COST
    hasThinking: true,
    thinkingRatioWarning: 5.0, // Alert if thinking > 5x output
    cheaperAlternative: 'gpt-5.2', 
    savingsPotential: 0.85 
  },
  
  'o3': {
    costPer1mInput: 10.00,
    costPer1mOutput: 40.00,
    costPer1mThinking: 20.00, // ⚠️ MASSIVE THINKING COST
    hasThinking: true,
    thinkingRatioWarning: 3.0,
    cheaperAlternative: 'gpt-5.3-codex',
    savingsPotential: 0.90
  },
  
  'o1': {
    costPer1mInput: 15.00,
    costPer1mOutput: 60.00,
    costPer1mThinking: 30.00,
    hasThinking: true,
    thinkingRatioWarning: 2.5,
    cheaperAlternative: 'o3',
    savingsPotential: 0.85
  },

  // LEGACY MODELS (The "Tax")
  'gpt-4o': { 
    costPer1mInput: 5.00, // 2x more than gpt-5.2
    costPer1mOutput: 15.00,
    hasThinking: false,
    cheaperAlternative: 'gpt-5.2', 
    savingsPotential: 0.90,
    flagAsLegacy: true
  }
};

export function generateRecommendations(data: UsageRow[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Rule 1: High GPT-4 usage with low token count
  const gpt4SmallRequests = data.filter(
    (r) => r.model.includes("gpt-4") && r.tokens_used < 1000
  );
  if (gpt4SmallRequests.length > 100) {
    const potentialSavings = gpt4SmallRequests.reduce(
      (acc, r) => acc + r.cost * 0.9,
      0
    );
    recommendations.push({
      id: "switch-to-35",
      severity: "high",
      title: "Switch small GPT-4 calls to GPT-3.5",
      description: `You have ${gpt4SmallRequests.length} requests under 1k tokens using GPT-4.`,
      impact: `Save ~$${potentialSavings.toFixed(2)}/month`,
      action:
        "Replace gpt-4 with gpt-3.5-turbo for requests < 1000 tokens",
      codeSnippet: `if (tokens < 1000) {\n  model = "gpt-3.5-turbo";\n}`,
    });
  }

  // Rule 2: Batching opportunities
  const hourlyCounts: Record<string, number> = {};
  data.forEach((r) => {
    const hour = r.timestamp.slice(0, 13); // YYYY-MM-DD HH
    hourlyCounts[hour] = (hourlyCounts[hour] ?? 0) + 1;
  });
  const batchableHours = Object.entries(hourlyCounts).filter(
    ([, count]) => count > 50
  );
  if (batchableHours.length > 0) {
    recommendations.push({
      id: "batch-requests",
      severity: "medium",
      title: "Implement request batching",
      description: `Found ${batchableHours.length} hours with 50+ individual requests.`,
      impact: "Reduce API calls by ~40%",
      action: "Buffer requests and send every 5 seconds or 100 items",
      codeSnippet: `// Implement simple batching\nconst batch = [];\nsetInterval(() => {\n  if (batch.length > 0) processBatch(batch);\n}, 5000);`,
    });
  }

  // Rule 3: Caching opportunities (repeated prompts – approximate by same model + similar tokens)
  const bucketKey = (r: UsageRow) =>
    `${r.model}|${Math.floor(r.tokens_used / 200)}`;
  const bucketCounts: Record<string, number> = {};
  data.forEach((r) => {
    const k = bucketKey(r);
    bucketCounts[k] = (bucketCounts[k] ?? 0) + 1;
  });
  const repeatedBuckets = Object.entries(bucketCounts).filter(
    ([, count]) => count > 20
  );
  if (repeatedBuckets.length > 5) {
    const totalRepeated = repeatedBuckets.reduce((acc, [, c]) => acc + c, 0);
    recommendations.push({
      id: "cache-prompts",
      severity: "medium",
      title: "Cache repeated prompts",
      description: `Many similar requests (same model, similar token size). ${totalRepeated} requests may be cacheable.`,
      impact: "Reduce latency and cost for duplicate prompts",
      action: "Add a cache (Redis or in-memory) for prompt+model key; reuse responses for identical inputs",
      codeSnippet: `const cacheKey = \`\${model}:\${hash(prompt)}\`;\nif (await cache.get(cacheKey)) return await cache.get(cacheKey);`,
    });
  }

  // Rule 4: High spend on expensive models
  const totalSpend = data.reduce((acc, r) => acc + r.cost, 0);
  const gpt4Spend = data
    .filter((r) => r.model.includes("gpt-4"))
    .reduce((acc, r) => acc + r.cost, 0);
  if (totalSpend > 0 && gpt4Spend / totalSpend > 0.7) {
    recommendations.push({
      id: "diversify-models",
      severity: "medium",
      title: "Diversify model usage",
      description:
        "Over 70% of spend is on GPT-4. Consider lighter models for non-critical tasks.",
      impact: "Potential 30–50% cost reduction",
      action:
        "Audit use cases and map to gpt-3.5-turbo, gpt-4o-mini where appropriate",
    });
  }

  // Rule 5: GPT-5 Pro usage detection (Research tier overkill)
  const gpt5ProRequests = data.filter((r) => r.model.includes("gpt-5-pro"));
  if (gpt5ProRequests.length > 0) {
    const proSpend = gpt5ProRequests.reduce((acc, r) => acc + r.cost, 0);
    const potentialSavings = proSpend * 0.90; // 90% savings potential
    recommendations.push({
      id: "downgrade-gpt5-pro",
      severity: "high",
      title: "GPT-5 Pro detected: Research tier",
      description: `Found ${gpt5ProRequests.length} requests using GPT-5 Pro.`,
      impact: `Save ~$${potentialSavings.toFixed(2)}/month by switching to GPT-5.2`,
      action: "Suggest downgrading to GPT-5.2 for standard agent tasks",
      codeSnippet: `if (model === "gpt-5-pro") {\n  model = "gpt-5.2";\n}`,
    });
  }

  // Rule 6: Legacy GPT-4o usage detection (now more expensive than GPT-5 base)
  const gpt4oRequests = data.filter((r) => r.model.includes("gpt-4o"));
  if (gpt4oRequests.length > 0) {
    const gpt4oSpend = gpt4oRequests.reduce((acc, r) => acc + r.cost, 0);
    const potentialSavings = gpt4oSpend * 0.90; // 90% savings potential
    recommendations.push({
      id: "migrate-gpt4o",
      severity: "high",
      title: "Legacy Model Alert: gpt-4o",
      description: `Found ${gpt4oRequests.length} requests using gpt-4o.`,
      impact: `Save ~$${potentialSavings.toFixed(2)}/month by migrating to gpt-5-mini`,
      action: "gpt-4o is now 2x more expensive than gpt-5 base. Migrate immediately.",
      codeSnippet: `if (model === "gpt-4o") {\n  model = "gpt-5-mini";\n}`,
    });
  }

  // Rule 7: Reasoning model usage detection (o3, o1, gpt-5.3-codex)
  const reasoningModelRequests = data.filter((r) => 
    r.model.includes("o3") || 
    r.model.includes("o1") || 
    r.model.includes("gpt-5.3-codex")
  );
  
  if (reasoningModelRequests.length > 0) {
    // Calculate thinking costs for reasoning models
    let totalThinkingCost = 0;
    let criticalFlags: any[] = [];
    
    reasoningModelRequests.forEach((request) => {
      const parsed = parseLineItem(request.model);
      if (parsed && parsed.isReasoningModel) {
        const costs = calculateTrueCost(parsed);
        if (costs) {
          totalThinkingCost += costs.thinkingCost;
          
          // Generate specific flags for this request
          const flags = generateThinkingFlags(parsed, costs);
          criticalFlags.push(...flags);
        }
      }
    });
    
    // Add summary recommendation if thinking costs are significant
    if (totalThinkingCost > 0.01) {
      recommendations.push({
        id: "reasoning-model-audit",
        severity: "high",
        title: "Reasoning Model Audit Required",
        description: `Found ${reasoningModelRequests.length} requests using reasoning models (o3, o1, gpt-5.3-codex).`,
        impact: `Hidden thinking costs: $${totalThinkingCost.toFixed(2)} (${(totalThinkingCost / data.reduce((acc, r) => acc + r.cost, 0) * 100).toFixed(0)}% of total bill)`,
        action: "Audit use cases - most teams pay 3x more than necessary for reasoning models.",
        codeSnippet: `// Route simple tasks to gpt-5.2\nif (taskComplexity < 3) {\n  model = "gpt-5.2";\n}`
      });
    }
    
    // Add critical flags as separate recommendations
    criticalFlags.forEach(flag => {
      recommendations.push({
        id: `thinking-flag-${Math.random().toString(36).substr(2, 9)}`,
        severity: flag.severity,
        title: flag.title,
        description: flag.message,
        impact: flag.impact,
        action: flag.action
      });
    });
  }

  return recommendations;
}
