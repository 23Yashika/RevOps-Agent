import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PostHogTrendPoint } from "../hooks/usePostHogData";

/**
 * Mini area chart showing revenue trend (using activeUsers as proxy).
 */
export function RevenueTrendArea({ data }: { data: PostHogTrendPoint[] }) {
  const chartData = data.map(p => ({ date: p.date, value: p.activeUsers }));
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-700 mb-2">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
