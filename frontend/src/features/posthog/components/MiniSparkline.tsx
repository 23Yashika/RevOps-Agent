import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

/**
 * Small sparkline chart for KPI cards.
 * `data` should be an array of numbers.
 */
export function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, index: i }));
  return (
    <ResponsiveContainer width="100%" height={30}>
      <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
