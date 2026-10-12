import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { PostHogSignal } from "../hooks/usePostHogData";

/**
 * Bar chart showing top accounts by high risk severity.
 */
export function TopAccountsBarChart({ signals }: { signals: PostHogSignal[] }) {
  const counts: Record<string, number> = {};
  signals.forEach((s) => {
    if (s.severity === "high") {
      counts[s.account] = (counts[s.account] || 0) + 1;
    }
  });
  const data = Object.entries(counts)
    .map(([account, value]) => ({ account, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Top Accounts by Risk</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="account" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="value" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
