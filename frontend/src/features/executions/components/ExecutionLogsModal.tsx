"use client";

import React from "react";
import { X, ShieldCheck, Terminal, FileCode, CheckCircle } from "lucide-react";
import type { ProposedAction } from "@/types";

interface ExecutionLogsModalProps {
  action: ProposedAction | null;
  onClose: () => void;
}

export function ExecutionLogsModal({ action, onClose }: ExecutionLogsModalProps) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 lg:ml-[var(--sidebar-width)]">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Execution Audit Log
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Action: {action.type} · Account: {action.accountName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* Simulation Notification */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Execution Simulated (Dry Run)</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Mode: DRY_RUN. Execution simulated; no external action or live modification was performed.
              </p>
            </div>
          </div>

          {/* Execution Metadata */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Action ID:</span>
              <span className="font-mono text-slate-800">{action.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-semibold text-emerald-700">{action.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Actor / Approver:</span>
              <span className="text-slate-800 font-semibold">{action.approver || "system"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Executed Timestamp:</span>
              <span className="text-slate-800">
                {action.executedAt ? new Date(action.executedAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Raw Payload Log */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-slate-400 mb-1">
              Raw Payload Log
            </h4>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
              {JSON.stringify(action.payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}