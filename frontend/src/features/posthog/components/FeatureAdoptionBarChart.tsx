import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FeatureAdoptionBarChartProps {
  kpis: {
    featureAdoption: number;
    topFeatureName: string;
    topFeatureGrowth: string;
  };
}

export function FeatureAdoptionBarChart({ kpis }: FeatureAdoptionBarChartProps) {
  // Derive mock module data from the overall adoption percentage.
  const base = kpis?.featureAdoption ?? 0;
  const topFeatureName = kpis?.topFeatureName ?? "Feature";
  const topFeatureGrowth = kpis?.topFeatureGrowth ?? "0%";
  const modules = [
    { name: topFeatureName, value: parseInt(topFeatureGrowth.replace(/%/g, "")) || base },
    { name: "Reports", value: Math.min(base, 80) },
    { name: "Dashboard", value: Math.min(base, 65) },
    { name: "Workflow", value: Math.min(base, 50) },
    { name: "Search", value: Math.min(base, 30) },
  ];
  const COLORS = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Feature Adoption by Module</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={modules} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip formatter={(value: number) => `${value}%`} />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {modules.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
