import React from "react";
import type { PostHogSignal } from "../hooks/usePostHogData";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

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
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="account"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}




