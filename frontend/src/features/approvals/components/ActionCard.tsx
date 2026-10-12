"use client";

import React from "react";
import { Check, X, Play, Eye, Clock, ShieldCheck, Mail, Calendar, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProposedAction } from "@/types";

interface ActionCardProps {
  action: ProposedAction;
  onViewDetails: (action: ProposedAction) => void;
  onApprove: (action: ProposedAction) => void;
  onReject: (action: ProposedAction) => void;
  onExecute: (action: ProposedAction) => void;
}

export function ActionCard({
  action,
  onViewDetails,
  onApprove,
  onReject,
  onExecute,
}: ActionCardProps) {
  const isPending = action.status === "PENDING";
  const isApproved = action.status === "APPROVED";
  const isExecuted = action.status === "EXECUTED";

  const riskScore = action.payload?.riskScore ?? 35;
  const riskLevel = action.payload?.riskLevel ?? "medium";

  // Relative timestamp
  const formatCreated = (isoStr: string) => {
    try {
      const diffMs = Date.now() - new Date(isoStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "Created recently";
      if (diffHours === 1) return "Created 1h ago";
      return `Created ${diffHours}h ago`;
    } catch {
      return "Created recently";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:border-slate-300 transition-all space-y-4">
      {/* Top Meta Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5929C4] to-[#6C3BDB] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{action.accountName}</h3>
              <span className="font-mono text-[11px] font-semibold text-[#171525] bg-[#FFFFFF] px-2 py-0.5 rounded-md">
                {action.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Risk Score: <span className="font-bold text-slate-700">{riskScore}</span> · {riskLevel}</span>
              <span>·</span>
              <span className="text-slate-400">{formatCreated(action.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Status Badge & Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusBadge status={action.status} />

          <button
            onClick={() => onViewDetails(action)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>

          {/* Pending: Show Approve / Reject buttons */}
          {isPending && (
            <>
              <button
                onClick={() => onApprove(action)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5A4330] hover:bg-[#30241D] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{action.type === "DRAFT_EMAIL" ? "Approve & Send Mail" : "Approve"}</span>
              </button>

              <button
                onClick={() => onReject(action)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {/* Approved: Show Execute button */}
          {isApproved && (
            <button
              onClick={() => onExecute(action)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute (Dry Run)</span>
            </button>
          )}
        </div>
      </div>

      {/* Rationale & Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
        {/* Rationale Column (2 cols) */}
        <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            AI Justification & Rationale
          </span>
          <p className="text-slate-700 leading-relaxed font-medium">
            {action.rationale}
          </p>
        </div>

        {/* Evidence Column (1 col) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Evidence Signals
          </span>
          <div className="space-y-1 text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>1 email matched</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>1 calendar event</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>1 contact linked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}