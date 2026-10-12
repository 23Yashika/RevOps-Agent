"use client";

import React from "react";
import { Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { CHART_COLORS } from "@/components/charts/ChartTheme";
import type { ProposedAction } from "@/types";

interface RecentActivityProps {
  actions: ProposedAction[];
  lastAnalysisTime: string | null;
  hubspotConnected: boolean;
  gmailConnected: boolean;
}

export function RecentActivity({
  actions,
  lastAnalysisTime,
  hubspotConnected,
  gmailConnected,
}: RecentActivityProps) {
  const approvedAction = actions.find((a) => a.status === "APPROVED");

  // Compute counts of actions by type for chart
  const actionCounts = actions.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const actionData = Object.entries(actionCounts).map(([type, count]) => ({ type, count }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
          <p className="text-xs text-slate-500">Latest pipeline and system events</p>
        </div>
      </div>
      {/* Activity Chart */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-700 mb-2">Activity Overview</h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={actionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.label, fontSize: 12 }} />
            <YAxis hide />
            <Tooltip formatter={(value: number) => `${value} actions`} />
            <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 divide-y divide-slate-100 py-2">
        {/* Activity Item 1: Analysis Run */}
        <div className="py-3 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-pageBg text-[#6C3BDB] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800 truncate">
                Analysis run completed
              </p>
              <span className="text-[10px] text-slate-400">
                {lastAnalysisTime ? "Today" : "Awaiting run"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {lastAnalysisTime
                ? `Groq Llama 3.3 evaluated pipeline deals`
                : "Click 'Run AI Analysis' to execute"}
            </p>
          </div>
        </div>

        {/* Activity Item 2: Action Approved / Created */}
        <div className="py-3 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {approvedAction ? "Action approved" : "Actions workflow"}
              </p>
              <span className="text-[10px] text-slate-400">
                {approvedAction ? "Recent" : "Ready"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {approvedAction
                ? `${approvedAction.type} · ${approvedAction.accountName}`
                : "Human-in-the-loop review ready"}
            </p>
          </div>
        </div>

        {/* Activity Item 3: Integration Sync */}
        <div className="py-3 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800 truncate">
                Integration status
              </p>
              <span className="text-[10px] text-slate-400">Sync</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              HubSpot: {hubspotConnected ? "Connected" : "Offline"} · Gmail:{" "}
              {gmailConnected ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}