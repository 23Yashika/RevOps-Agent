import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface AccountHealthDonutProps {
  kpis: {
    activeUsers: number;
    featureAdoption: number;
    decliningAccounts: number;
  };
}

export function AccountHealthDonut({ kpis }: AccountHealthDonutProps) {
  const total = kpis.activeUsers + kpis.featureAdoption + kpis.decliningAccounts;
  const data = [
    { name: "Healthy", value: kpis.activeUsers },
    { name: "Warning", value: kpis.featureAdoption },
    { name: "Critical", value: kpis.decliningAccounts },
  ];
  const COLORS = ["#10B981", "#F59E0B", "#EF4444"]; // green, amber, red

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Account Health Distribution</h3>
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value} (${((value / total) * 100).toFixed(1)}%)`} />
        <Legend />
      </PieChart>
    </div>
  );
}
