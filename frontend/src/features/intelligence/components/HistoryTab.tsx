"use client";

import React from "react";
import { History, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

interface HistoryTabProps {
  analysisRunId: string;
  generatedAt: string;
  aiModel: string;
}

export function HistoryTab({ analysisRunId, generatedAt, aiModel }: HistoryTabProps) {
  const formattedDate = new Date(generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Analysis & Execution Audit Trail</h3>
          <p className="text-xs text-slate-500">
            Immutable log of AI evaluations and proposed actions persisted in PostgreSQL.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="py-4 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">AI Analysis Run Completed</p>
                <span className="text-[11px] text-slate-400">{formattedDate}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Run ID: {analysisRunId} · Model: {aiModel}
              </p>
            </div>
          </div>

          <div className="py-4 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900">Proposed Action Created</p>
                <span className="text-[11px] text-slate-400">Recorded</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Type: NOTIFY_OWNER · Status: PENDING review in Approval Center
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}