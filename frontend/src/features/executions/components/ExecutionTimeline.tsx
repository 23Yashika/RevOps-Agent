"use client";

import React from "react";
import { CheckCircle2, Clock, ShieldCheck, Play, Eye } from "lucide-react";
import type { ProposedAction } from "@/types";

interface ExecutionTimelineProps {
  action: ProposedAction | null;
  onViewLogs: (action: ProposedAction) => void;
}

export function ExecutionTimeline({ action, onViewLogs }: ExecutionTimelineProps) {
  if (!action) return null;

  const isApproved =
    action.status === "APPROVED" ||
    action.status === "EXECUTING" ||
    action.status === "EXECUTED";
  const isExecuting =
    action.status === "EXECUTING" || action.status === "EXECUTED";
  const isExecuted = action.status === "EXECUTED";

  const formatTime = (isoStr: string | null) => {
    if (!isoStr) return "--:--";
    try {
      return new Date(isoStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Action Execution Details: {action.accountName}
          </h3>
          <p className="text-xs text-slate-500">
            Lifecycle transition audit trail from proposal to execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dry-Run Simulation (Safe)</span>
          </span>

          <button
            onClick={() => onViewLogs(action)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View Logs
          </button>
        </div>
      </div>

      {/* Horizontal Lifecycle Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        {/* Step 1: Proposed */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Proposed</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {formatTime(action.createdAt)}
            </p>
          </div>
        </div>

        {/* Step 2: Approved */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isApproved
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Approved</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {isApproved ? formatTime(action.approvedAt || action.createdAt) : "Pending"}
            </p>
          </div>
        </div>

        {/* Step 3: Executing */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isExecuting
                ? "bg-indigo-50 text-indigo-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Play className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Executing</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {isExecuting ? formatTime(action.executedAt || action.updatedAt) : "Pending"}
            </p>
          </div>
        </div>

        {/* Step 4: Executed */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isExecuted
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Executed</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {isExecuted ? formatTime(action.executedAt) : "Not Executed"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}