"use client"

import Link from "next/link"
import { Download, FileText, Star, TrendingDown, Users } from "lucide-react"

export default function SampleReportPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Sample Expert Audit Report
        </h1>
        <p className="text-lg text-slate-400 mb-8">
          Example of what you receive with the £299 audit
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Professional Analysis
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Custom Code Fixes
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Implementation Guidance
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Executive Summary */}
        <section className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            Executive Summary
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Current Spend</h3>
              <p className="text-3xl font-bold text-emerald-400 mb-2">£4,250/mo</p>
              <p className="text-slate-400 text-sm">Based on 150K tokens/month</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Potential Savings</h3>
              <p className="text-3xl font-bold text-amber-400 mb-2">£1,820/mo</p>
              <p className="text-slate-400 text-sm">43% reduction possible</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Implementation Time</h3>
              <p className="text-3xl font-bold text-blue-400 mb-2">2-3 days</p>
              <p className="text-slate-400 text-sm">Estimated rollout time</p>
            </div>
          </div>
          <div className="mt-8 p-6 bg-slate-900/50 border border-slate-700 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-4">Key Findings</h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>40% of requests use GPT-4 when GPT-3.5 would suffice</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Missing response caching for repeated queries</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Suboptimal prompt engineering increasing token usage</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
          <h2 className="text-2xl font-bold text-white mb-6">Cost Breakdown</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">By Model</h3>
              <div className="space-y-3">
                {[
                  { model: 'GPT-4', cost: 2850, percentage: 67, color: 'bg-red-500' },
                  { model: 'GPT-3.5 Turbo', cost: 950, percentage: 22, color: 'bg-green-500' },
                  { model: 'Embeddings', cost: 320, percentage: 8, color: 'bg-blue-500' },
                  { model: 'Fine-tuning', cost: 130, percentage: 3, color: 'bg-purple-500' }
                ].map((item) => (
                  <div key={item.model} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-white font-medium">{item.model}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">£{item.cost}</p>
                      <p className="text-slate-400 text-sm">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">By Usage Pattern</h3>
              <div className="space-y-3">
                {[
                  { pattern: 'Real-time queries', cost: 2100, percentage: 49, color: 'bg-red-500' },
                  { pattern: 'Batch processing', cost: 1200, percentage: 28, color: 'bg-yellow-500' },
                  { pattern: 'Development/testing', cost: 650, percentage: 15, color: 'bg-blue-500' },
                  { pattern: 'Caching opportunities', cost: 300, percentage: 8, color: 'bg-green-500' }
                ].map((item) => (
                  <div key={item.pattern} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{item.pattern}</p>
                      <p className="text-slate-400 text-sm">Optimization potential</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">£{item.cost}</p>
                      <p className="text-slate-400 text-sm">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Fixes */}
        <section className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
          <h2 className="text-2xl font-bold text-white mb-6">Recommended Fixes</h2>
          
          {/* Code Example */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">1. Model Selection Optimization</h3>
            <pre className="text-sm text-slate-300 overflow-auto">
{`// BEFORE: Always using GPT-4
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: userInput }],
  max_tokens: 1000
});

// AFTER: Smart model selection based on complexity
const model = shouldUseGPT4(userInput) ? "gpt-4" : "gpt-3.5-turbo";
const response = await openai.chat.completions.create({
  model,
  messages: [{ role: "user", content: userInput }],
  max_tokens: 1000
});

function shouldUseGPT4(input) {
  // Logic to determine if GPT-4 is actually needed
  return input.length > 5000 || 
         containsComplexTask(input) ||
         requiresLatestKnowledge(input);
}`}
            </pre>
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 text-sm">
                <strong>Expected Savings:</strong> £1,200/month (42% reduction in model costs)
              </p>
            </div>
          </div>

          {/* Caching Example */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">2. Response Caching Implementation</h3>
            <pre className="text-sm text-slate-300 overflow-auto">
{`// BEFORE: No caching
async function getAnswer(question) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: question }]
  });
  return response.choices[0].message.content;
}

// AFTER: Redis-based caching
const redis = new Redis(process.env.REDIS_URL);

async function getAnswer(question) {
  const cacheKey = \`answer:\${hash(question)}\`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: question }]
  });
  
  const answer = response.choices[0].message.content;
  await redis.setex(cacheKey, 3600, JSON.stringify(answer)); // 1 hour TTL
  
  return answer;
}`}
            </pre>
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 text-sm">
                <strong>Expected Savings:</strong> £450/month (60% reduction in repeated queries)
              </p>
            </div>
          </div>

          {/* Prompt Optimization */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">3. Prompt Engineering</h3>
            <pre className="text-sm text-slate-300 overflow-auto">
{`// BEFORE: Inefficient prompt
const prompt = \`Answer this question: \${question}. Be very detailed and thorough.\`;

// AFTER: Optimized prompt with clear constraints
const prompt = \`Answer concisely in 2-3 sentences:
Question: \${question}
Constraints: Max 150 tokens, focus on key points only.\`;`}
            </pre>
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400 text-sm">
                <strong>Expected Savings:</strong> £170/month (30% reduction in token usage)
              </p>
            </div>
          </div>
        </section>

        {/* Implementation Timeline */}
        <section className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
          <h2 className="text-2xl font-bold text-white mb-6">Implementation Timeline</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Week 1</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Implement model selection logic
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Set up Redis caching infrastructure
                </li>
              </ul>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Week 2</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Deploy caching layer
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Optimize prompt templates
                </li>
              </ul>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Week 3</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Monitor savings and adjust
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Document new patterns
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-strong p-8 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Save £1,820/month?</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              This is just a sample. Your actual audit will be tailored to your specific usage patterns 
              and provide even more targeted savings opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 hover-scale transition-all text-lg border-2 border-emerald-400/50">
                  Get Your Own Audit - Upload CSV
                </button>
              </Link>
              <Link href="/#pricing">
                <button className="border border-slate-700 hover:bg-slate-800 px-8 py-4 rounded-full transition-all duration-300 text-lg hover-scale text-white">
                  View Pricing
                </button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Free analysis available after login • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}