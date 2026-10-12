import React from "react";
import { RadialBarChart, RadialBar, Legend, Tooltip } from "recharts";

/**
 * Gauge showing high‑risk deals percentage.
 * Expects a value between 0‑100.
 */
export function HighRiskGauge({ value }: { value: number }) {
  const data = [{ name: "High Risk", value }];
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-700 mb-2">High Risk Deals</h3>
      <RadialBarChart
        width={200}
        height={200}
        innerRadius={70}
        outerRadius={90}
        data={data}
        startAngle={180}
        endAngle={0}
        barSize={20}
      >
<RadialBar background dataKey="value" fill="#EF4444" />
        <Tooltip formatter={(v) => `${v}%`} />
        <Legend />
      </RadialBarChart>
    </div>
  );
}
