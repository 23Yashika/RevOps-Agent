use client;

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface Signal {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  account: string;
}

interface SignalSeverityChartProps {
  /** Full signals array from usePostHogData */
  signals: Signal[];
}

export function SignalSeverityChart({ signals }: SignalSeverityChartProps) {
  const counts = {
    high: signals.filter((s) => s.severity === "high").length,
    medium: signals.filter((s) => s.severity === "medium").length,
    low: signals.filter((s) => s.severity === "low").length,
  };

  const data = [
    { name: "High", value: counts.high, fill: "#EF4444" },
    { name: "Medium", value: counts.medium, fill: "#F59E0B" },
    { name: "Low", value: counts.low, fill: "#10B981" },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Signal Severity Distribution</h3>
      <PieChart width={200} height={200}>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value} signal(s)`} />
        <Legend />
      </PieChart>
    </div>
  );
}
