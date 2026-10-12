import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

/**
 * Simple Weekly Activity Heatmap placeholder.
 * Expects an array of objects with `day` and `value` fields.
 */
export function WeeklyActivityHeatmap({ data }: { data: { day: string; value: number }[] }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-700 mb-2">Weekly Activity Heatmap</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="value" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
