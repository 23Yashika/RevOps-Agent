import React from "react";
import { RadialBarChart, RadialBar, Tooltip, Legend } from "recharts";

/**
 * Radial bar chart representing pending actions as a percentage.
 * Uses static placeholder value (e.g., 21 pending out of 100).
 */
export function PendingActionsRadial() {
  const data = [{ name: "Pending", value: 21, fill: "#22c55e" }];
  const total = 100;
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-700 mb-2">Pending Actions</h3>
      <RadialBarChart
        width={200}
        height={200}
        innerRadius={60}
        outerRadius={80}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar background dataKey="value" fill="#22c55e" />
        <Tooltip formatter={(value) => `${value} / ${total}`} />
        <Legend />
      </RadialBarChart>
    </div>
  );
}
