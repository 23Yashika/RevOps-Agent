"use client";

import React from "react";
import { X, CheckCircle, Clock, ShieldCheck, FileText, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProposedAction } from "@/types";

interface ActionDetailModalProps {
  action: ProposedAction | null;
  onClose: () => void;
}

export function ActionDetailModal({ action, onClose }: ActionDetailModalProps) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Action Payload & Audit Details
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">ID: {action.id}</p>
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
          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Target Account
              </span>
              <span className="font-bold text-slate-900">{action.accountName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Status
              </span>
              <StatusBadge status={action.status} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Action Type
              </span>
              <span className="font-mono font-semibold text-blue-600">
                {action.type}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Created At
              </span>
              <span className="text-slate-700">
                {new Date(action.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Rationale */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-slate-400 mb-1">
              AI Rationale
            </h4>
            <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-medium">
              {action.rationale}
            </p>
          </div>

          {/* Reviewer Information */}
          {action.approver && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-start gap-2.5">
              <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900">
                  Reviewed by {action.approver}
                </p>
                {action.approvalNote && (
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Note: "{action.approvalNote}"
                  </p>
                )}
                <p className="text-[10px] text-blue-600 mt-0.5">
                  Timestamp:{" "}
                  {new Date(
                    action.approvedAt || action.rejectedAt || action.createdAt
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Proposed Payload JSON */}
          <div>
            <h4 className="text-[11px] uppercase font-bold text-slate-400 mb-1">
              Payload Parameters
            </h4>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
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