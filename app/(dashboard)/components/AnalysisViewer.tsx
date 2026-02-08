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

interface AnalysisViewerProps {
  totalSpend: number;
  totalRequests: number;
  topModels: { model: string; cost: number; tokens: number }[];
  spendByDay?: { date: string; cost: number }[];
  recommendations: Recommendation[];
}

export function AnalysisViewer({
  totalSpend,
  totalRequests,
  topModels,
  spendByDay = [],
  recommendations,
}: AnalysisViewerProps) {
  const barData = topModels.map((m) => ({
    name: m.model.length > 15 ? m.model.slice(0, 12) + "…" : m.model,
    cost: Number(m.cost.toFixed(2)),
    fullName: m.model,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Spend</p>
          <p className="text-2xl font-bold text-slate-800">
            ${totalSpend.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Requests</p>
          <p className="text-2xl font-bold text-slate-800">
            {totalRequests.toLocaleString()}
          </p>
        </div>
      </div>

      {barData.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">
            Cost by Model (Bar)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(_, i) => barData[i]?.fullName?.slice(0, 12) ?? ""}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? ""
                  }
                />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {spendByDay.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">
            Spend Over Time (Line)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={spendByDay.map((d) => ({
                  ...d,
                  cost: Number(d.cost.toFixed(2)),
                }))}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Daily spend"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {topModels.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">Top Models by Cost</h3>
          <ul className="space-y-2">
            {topModels.map((m) => (
              <li
                key={m.model}
                className="flex justify-between text-sm text-slate-600"
              >
                <span>{m.model}</span>
                <span>
                  ${m.cost.toFixed(2)} · {m.tokens.toLocaleString()} tokens
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">
            Automated Recommendations
          </h3>
          <ul className="space-y-4">
            {recommendations.map((r) => (
              <li
                key={r.id}
                className="rounded border-l-4 border-slate-300 bg-slate-50 p-3 pl-4"
                style={{
                  borderLeftColor:
                    r.severity === "high"
                      ? "#dc2626"
                      : r.severity === "medium"
                        ? "#d97706"
                        : "#059669",
                }}
              >
                <p className="font-medium text-slate-800">{r.title}</p>
                <p className="text-sm text-slate-600">{r.description}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  Impact: {r.impact}
                </p>
                <p className="text-sm text-slate-600">Action: {r.action}</p>
                {r.codeSnippet && (
                  <div className="relative mt-2">
                    <CopyButton codeString={r.codeSnippet} />
                    <pre className="overflow-x-auto rounded bg-slate-800 p-2 pr-10 text-xs text-slate-100">
                      {r.codeSnippet}
                    </pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
