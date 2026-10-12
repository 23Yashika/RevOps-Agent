import React from "react";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";
import type { PostHogSignal } from "../hooks/usePostHogData";

/**
 * Radial gauge showing overall AI risk score (0-100).
 * Uses a single RadialBar for the score and background track.
 */
export function AIRiskGauge({ score }: { score: number }) {
  const data = [{ name: "Risk", value: score }];
  const max = 100;
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">AI Risk Score</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          barSize={10}
          data={data}
          startAngle={180}
          endAngle={0}

        >
<RadialBar background dataKey="value" fill="#EF4444" />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
