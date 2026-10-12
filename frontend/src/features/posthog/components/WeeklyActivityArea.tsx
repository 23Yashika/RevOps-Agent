"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface WeeklyActivityAreaProps {
  /** Data from usePostHogData */
  data: { date: string; activeUsers: number }[];
}

export function WeeklyActivityArea({ data }: WeeklyActivityAreaProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">Weekly Activity (Active Users)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              border: "none",
              borderRadius: "12px",
              color: "#FFFFFF",
              fontSize: "12px",
            }}
          />
          <Area type="monotone" dataKey="activeUsers" stroke="#2563EB" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
