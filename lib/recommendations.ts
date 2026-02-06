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

  return recommendations;
}
