import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

/**
 * Simple User Journey Funnel placeholder.
 * Expects an array of objects with `stage` and `value` fields.
 */
export function UserJourneyFunnel({
  data,
}: {
  data: { stage: string; value: number }[];
}) {
  const colors = ["#6366F1", "#4F46E5", "#4338CA", "#3730A3"]; // gradient shades

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-700 mb-2">
        User Journey Funnel
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="stage"
            type="category"
            width={120}
            tick={{ fill: "#334155", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), "Users"]}
          />
          <Bar dataKey="value" fill="#6366F1">
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
