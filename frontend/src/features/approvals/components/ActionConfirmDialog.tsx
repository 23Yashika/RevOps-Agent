"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Play, X, Loader2, Send, Mail } from "lucide-react";
import type { ProposedAction } from "@/types";

interface ActionConfirmDialogProps {
  dialog: {
    action: ProposedAction;
    type: "APPROVE" | "REJECT" | "EXECUTE";
  } | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirmApprove: (id: string, note?: string) => void;
  onConfirmReject: (id: string, note?: string) => void;
  onConfirmExecute: (id: string) => void;
}

export function ActionConfirmDialog({
  dialog,
  isSubmitting,
  onClose,
  onConfirmApprove,
  onConfirmReject,
  onConfirmExecute,
}: ActionConfirmDialogProps) {
  const [note, setNote] = useState("");

  if (!dialog) return null;

  const { action, type } = dialog;
  const isEmailApproval = type === "APPROVE" && action.type === "DRAFT_EMAIL";

  const clientEmail = action.payload?.to || "radspatidar16@gmail.com";
  const emailSubject =
    action.payload?.subject ||
    `Confirming next steps for ${action.accountName || "your proposal"}`;
  const emailBody = action.payload?.body;

  const handleConfirm = () => {
    if (type === "APPROVE") {
      onConfirmApprove(action.id, note);
    } else if (type === "REJECT") {
      onConfirmReject(action.id, note);
    } else if (type === "EXECUTE") {
      onConfirmExecute(action.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                type === "APPROVE"
                  ? isEmailApproval
                    ? "bg-blue-50 text-blue-600"
                    : "bg-emerald-50 text-emerald-600"
                  : type === "REJECT"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {type === "APPROVE" && (isEmailApproval ? <Mail className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />)}
              {type === "REJECT" && <XCircle className="w-5 h-5" />}
              {type === "EXECUTE" && <Play className="w-5 h-5" />}
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 mt-3">
            {type === "APPROVE"
              ? isEmailApproval
                ? "Approve & Send Email to Client?"
                : "Approve Proposed Action?"
              : type === "REJECT"
              ? "Reject Proposed Action?"
              : "Execute Action in Dry-Run Mode?"}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {type === "APPROVE"
              ? isEmailApproval
                ? `You are confirming approval for ${action.accountName} (${action.type}). Approving will immediately send the follow-up email via Gmail to the recipient.`
                : `You are confirming approval for ${action.accountName} (${action.type}). Once approved, it can be safely executed.`
              : type === "REJECT"
              ? `You are declining this proposed action for ${action.accountName}. It will not be executed.`
              : `This will execute the action in dry-run mode (DRY_RUN=true). No external live changes will be made to customer systems.`}
          </p>

          {/* Email Preview for DRAFT_EMAIL */}
          {isEmailApproval && (
            <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recipient
                </span>
                <span className="font-semibold text-slate-900">{clientEmail}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Subject Line
                </span>
                <span className="font-medium text-slate-800">{emailSubject}</span>
              </div>
              {emailBody && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Email Body Preview
                  </span>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 max-h-28 overflow-y-auto whitespace-pre-line text-[11px] leading-relaxed">
                    {emailBody}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Reviewer Note Input */}
          {type !== "EXECUTE" && (
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Reviewer Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  type === "APPROVE"
                    ? "e.g., Confirmed with account AE"
                    : "e.g., Deal already scheduled"
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-white ${
              type === "APPROVE"
                ? "bg-[#5A4330] hover:bg-[#30241D]"
                : type === "REJECT"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEmailApproval ? "Sending via Gmail..." : "Processing..."}</span>
              </>
            ) : (
              <>
                {isEmailApproval && <Send className="w-3.5 h-3.5" />}
                <span>
                  {type === "APPROVE"
                    ? isEmailApproval
                      ? "Confirm & Send Email"
                      : "Confirm Approval"
                    : type === "REJECT"
                    ? "Confirm Rejection"
                    : "Execute Dry Run"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
