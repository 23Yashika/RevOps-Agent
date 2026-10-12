import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { PostHogSignal } from "../hooks/usePostHogData";

/**
 * Donut chart visualising the distribution of signal severities (High, Medium, Low).
 */
export function RiskDistributionDonut({ signals }: { signals: PostHogSignal[] }) {
  const counts = signals.reduce(
    (acc, sig) => {
      acc[sig.severity] = (acc[sig.severity] || 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<string, number>
  );

  const data = [
    { name: "High", value: counts.high },
    { name: "Medium", value: counts.medium },
    { name: "Low", value: counts.low },
  ];

  const COLORS = ["#EF4444", "#F59E0B", "#10B981"];
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Risk Distribution</h3>
      <PieChart width={200} height={200}>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value} (${((value / total) * 100).toFixed(1)}%)`} />
        <Legend />
      </PieChart>
    </div>
  );
}
