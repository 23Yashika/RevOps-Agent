"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface RiskDistributionChartProps {
  lowCount: number;
  mediumCount: number;
  highCount: number;
  totalDeals: number;
}

export function RiskDistributionChart({
  lowCount,
  mediumCount,
  highCount,
  totalDeals,
}: RiskDistributionChartProps) {
  const data = [
    { name: "Low Risk", value: lowCount, color: "#10B981" },
    { name: "Medium Risk", value: mediumCount, color: "#F59E0B" },
    { name: "High Risk", value: highCount, color: "#EF4444" },
  ];

  // If no deals analyzed yet, show placeholder segment
  const chartData = totalDeals === 0 ? [{ name: "No Data", value: 1, color: "#E2E8F0" }] : data;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Risk Distribution</h3>
          <p className="text-xs text-slate-500">Pipeline segmented by AI risk score</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
        {/* Donut Chart with center label */}
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={72}
                paddingAngle={totalDeals > 0 ? 3 : 0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-800 leading-none">
              {totalDeals}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase mt-1">
              Deals
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Low Risk</span>
            </div>
            <span className="font-bold text-slate-800">{lowCount}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">Medium Risk</span>
            </div>
            <span className="font-bold text-slate-800">{mediumCount}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">High Risk</span>
            </div>
            <span className="font-bold text-slate-800">{highCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}