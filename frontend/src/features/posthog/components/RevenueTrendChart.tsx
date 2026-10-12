import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { PostHogTrendPoint } from "../hooks/usePostHogData";

/**
 * Line chart showing revenue (active users) trend over time.
 */
export function RevenueTrendChart({ data }: { data: PostHogTrendPoint[] }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="activeUsers" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
