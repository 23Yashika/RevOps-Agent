import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PostHogSignal } from "../hooks/usePostHogData";

/**
 * Overview component for risk distribution.
 * Shows a donut chart plus a textual summary of percentages.
 */
export function RiskDistributionOverview({ signals }: { signals: PostHogSignal[] }) {
  const counts = signals.reduce(
    (acc, sig) => {
      acc[sig.severity] = (acc[sig.severity] || 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<string, number>
  );

  const total = counts.high + counts.medium + counts.low || 1;
  const data = [
    { name: "High", value: counts.high, percent: ((counts.high / total) * 100).toFixed(1) },
    { name: "Medium", value: counts.medium, percent: ((counts.medium / total) * 100).toFixed(1) },
    { name: "Low", value: counts.low, percent: ((counts.low / total) * 100).toFixed(1) },
  ];

  const COLORS = ["#6C3BDB", "#FBBF24", "#60A5FA"]; // high purple, medium amber, low blue

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow mt-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Risk Distribution Overview</h3>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-xs mx-auto">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => {
                  const percent = ((value / total) * 100).toFixed(1);
                  return `${value} (${percent}%)`;
                }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Textual summary */}
        <ul className="mt-4 space-y-1 text-xs text-slate-600">
          {data.map((d) => (
            <li key={d.name} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3" style={{ backgroundColor: COLORS[data.findIndex((x) => x.name === d.name)] }}></span>
              <span>{d.name}: {d.percent}% ({d.value})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
