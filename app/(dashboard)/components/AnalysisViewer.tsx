"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { Recommendation } from "@/lib/recommendations";
import { CopyButton } from "./CopyButton";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";

// Custom Tooltip Component for Glassmorphism
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="glass-strong p-3 border border-slate-700/50 shadow-2xl shadow-black/50">
      <p className="text-sm text-slate-300 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm text-white">
          {entry.dataKey === 'cost' ? `$${entry.value.toFixed(2)}` : entry.value}
        </p>
      ))}
    </div>
  );
};

interface AnalysisViewerProps {
  totalSpend: number;
  totalRequests: number;
  topModels: { model: string; cost: number; tokens: number; displayName?: string }[];
  spendByDay?: { date: string; cost: number }[];
  recommendations: Recommendation[];
}

// Helper function to parse model name from line_item (for backwards compatibility)
function parseModelName(lineItem: string): string {
  return lineItem?.split(':')[0] || 'Unknown';
}

// Helper function to parse token info from line_item (for backwards compatibility)
function parseTokenInfo(lineItem: string): { inputTokens: number; outputTokens: number } {
  const tokenInfo = lineItem?.split(':')[1] || '';
  const [inputStr, outputStr] = tokenInfo.split('+');
  return {
    inputTokens: parseInt(inputStr || '0', 10),
    outputTokens: parseInt(outputStr || '0', 10)
  };
}

export function AnalysisViewer({
  totalSpend,
  totalRequests,
  topModels,
  spendByDay = [],
  recommendations,
}: AnalysisViewerProps) {
  const barData = topModels.map((m) => {
    // Use displayName from API if available, otherwise parse from model
    const displayName = m.displayName || parseModelName(m.model);
    
    return {
      name: displayName.length > 15 ? displayName.slice(0, 12) + "…" : displayName,
      cost: Number(m.cost.toFixed(2)),
      fullName: displayName,
      fullLineItem: m.model, // Keep full line_item for tooltip if needed
    };
  });

  // Chart animation refs
  const [barChartRef, barChartVisible] = useIntersectionObserver({ threshold: 0.3 });
  const [lineChartRef, lineChartVisible] = useIntersectionObserver({ threshold: 0.3 });

  return (
    <div className="space-y-6">
      {/* Main Chart Area */}
      <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis</h3>
        
        {/* Bar Chart */}
        {barData.length > 0 && (
          <div className="h-64 sm:h-72 lg:h-80 mb-8" ref={barChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={barData} 
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                className={barChartVisible ? 'chart-enter-active' : 'chart-enter'}
              >
                <CartesianGrid stroke="#334155" strokeDasharray="2 2" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(_, i) => barData[i]?.fullName?.slice(0, 12) ?? ""}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(v) => `$${v}`}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="cost" 
                  fill="url(#violetGradient)" 
                  radius={[4, 4, 0, 0]}
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <defs>
                  <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Line Chart */}
        {spendByDay.length > 0 && (
          <div className="h-80" ref={lineChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={spendByDay.map((d) => ({
                  ...d,
                  cost: Number(d.cost.toFixed(2)),
                }))}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                className={lineChartVisible ? 'chart-enter-active' : 'chart-enter'}
              >
                <CartesianGrid stroke="#334155" strokeDasharray="2 2" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(v) => `$${v}`}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }}
                  name="Daily spend"
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Models List */}
      {topModels.length > 0 && (
        <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Models by Cost</h3>
          <div className="space-y-3">
            {topModels.map((m) => {
              const displayName = m.displayName || parseModelName(m.model);
              const tokenInfo = parseTokenInfo(m.model);
              const hasTokenDetails = tokenInfo.inputTokens > 0 || tokenInfo.outputTokens > 0;
              
              return (
                <div key={m.model} className="flex items-center justify-between glass p-3 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="text-slate-100 font-medium text-sm">{displayName}</p>
                    {hasTokenDetails ? (
                      <p className="text-slate-400 text-xs">
                        {tokenInfo.inputTokens.toLocaleString()} input / {tokenInfo.outputTokens.toLocaleString()} output tokens
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs">{m.tokens.toLocaleString()} tokens</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">${m.cost.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="glass-strong p-6 rounded-xl border border-slate-800/80 shadow-2xl shadow-black/50">
          <h3 className="text-lg font-semibold text-white mb-4">Automated Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((r) => (
              <div key={r.id} className="glass p-4 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      r.severity === 'high' ? 'bg-red-500' : 
                      r.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <div>
                      <h4 className="text-slate-100 font-semibold text-sm">{r.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{r.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">
                      Impact: £{(r.impact as string)?.replace('$', '') || '0'}/month
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">Action: {r.action}</p>
                  {r.codeSnippet && (
                    <button className="text-xs text-slate-300 border border-slate-700 hover:bg-slate-800 px-3 py-1 rounded transition-colors hover-scale">
                      Copy Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
