"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PostHogSignal } from "../hooks/usePostHogData";

interface TopSignalsProps {
  signals: PostHogSignal[];
}

export function TopSignals({ signals }: TopSignalsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Top Signals</h3>
          <p className="text-xs text-slate-500">Telemetry-driven revenue risk events</p>
        </div>
      </div>

      <div className="flex-1 divide-y divide-slate-100">
        {signals.map((sig) => (
          <div key={sig.id} className="py-3.5 flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                sig.severity === "high"
                  ? "bg-rose-50 text-rose-600"
                  : sig.severity === "medium"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {sig.severity === "high" && <AlertCircle className="w-4 h-4" />}
              {sig.severity === "medium" && <AlertTriangle className="w-4 h-4" />}
              {sig.severity === "low" && <CheckCircle2 className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {sig.title}
                </p>
                <Link
                  href="/deals"
                  className="text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Account: <span className="font-semibold text-slate-700">{sig.account}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}