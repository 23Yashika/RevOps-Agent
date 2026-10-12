"use client";

import React from "react";
import { Eye, ShieldCheck, Clock, User, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProposedAction } from "@/types";

interface ExecutionsTableProps {
  actions: ProposedAction[];
  activeActionId?: string;
  onSelectAction: (action: ProposedAction) => void;
  onViewLogs: (action: ProposedAction) => void;
}

export function ExecutionsTable({
  actions,
  activeActionId,
  onSelectAction,
  onViewLogs,
}: ExecutionsTableProps) {
  const formatActionTitle = (type: string) => {
    switch (type) {
      case "NOTIFY_OWNER":
        return "Notify owner";
      case "DRAFT_EMAIL":
        return "Draft email";
      case "CREATE_TASK":
        return "Create task";
      case "UPDATE_CRM":
        return "Update CRM";
      default:
        return type;
    }
  };

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "--";
    try {
      return new Date(isoStr).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Action</th>
              <th className="py-3.5 px-4">Account</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Executed At</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {actions.map((action) => {
              const isSelected = activeActionId === action.id;
              return (
                <tr
                  key={action.id}
                  onClick={() => onSelectAction(action)}
                  className={`transition-colors cursor-pointer ${isSelected ? "bg-pageBg/50" : "hover:bg-slate-50/70"
                    }`}
                >
                  {/* Action */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-900 block">
                      {formatActionTitle(action.type)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{action.id.slice(-6)}
                    </span>
                  </td>

                  {/* Account */}
                  <td className="py-4 px-4 font-semibold text-slate-800">
                    {action.accountName}
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4">
                    <span className="font-mono text-[11px] font-semibold text-[#6C3BDB] bg-pageBg px-2 py-0.5 rounded-md">
                      {action.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <StatusBadge status={action.status} />
                  </td>

                  {/* Executed At */}
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                    {formatDate(action.executedAt || action.updatedAt)}
                  </td>

                  {/* Actor */}
                  <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{action.approver || "system"}</span>
                    </div>
                  </td>

                  {/* Actions / View Logs */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLogs(action);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Logs</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}