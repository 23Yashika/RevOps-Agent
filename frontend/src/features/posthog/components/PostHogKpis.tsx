"use client";

import React from "react";
import { Users, Zap, TrendingDown, ArrowUpRight, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { MiniSparkline } from "./MiniSparkline";

interface PostHogKpisProps {
  kpis: {
    activeUsers: number;
    activeUsersChange: string;
    featureAdoption: number;
    featureAdoptionChange: string;
    decliningAccounts: number;
    decliningChange: string;
    topFeatureGrowth: string;
    topFeatureName: string;
  };
}

export function PostHogKpis({ kpis }: PostHogKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Users */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Active Users
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {kpis.activeUsers.toLocaleString()}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <span>↑ {kpis.activeUsersChange}</span>
            <span className="text-slate-400 font-normal">vs. last month</span>
          </p>
        </div>
      </div>

      {/* 2. Feature Adoption */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Feature Adoption
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {kpis.featureAdoption}%
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <span>↑ {kpis.featureAdoptionChange}</span>
            <span className="text-slate-400 font-normal">core workflows</span>
          </p>
        <div className="mt-2 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[{v:0},{v:20},{v:40},{v:30},{v:60}]}>
            <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>
      </div>

      {/* 3. Declining Usage */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Declining Usage
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {kpis.decliningAccounts}{" "}
            <span className="text-sm font-normal text-slate-500">accounts</span>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-rose-600 font-medium">
            <span>↓ {kpis.decliningChange}</span>
            <span className="text-slate-400 font-normal">churn risk</span>
          </p>
        </div>
      </div>
        {/* 4. Top Feature Growth */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Top Feature Growth
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {kpis.topFeatureGrowth}
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {kpis.topFeatureName} module
            </p>
          </div>
        </div>
    </div>
  );
}