"use client";

import React, { useState } from "react";
import { Copy, Check, Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/providers/toast-provider";
import type { DealAnalysis } from "@/types";

interface EmailDraftTabProps {
  deal: DealAnalysis;
  onCopy: (text: string) => void;
}

export function EmailDraftTab({ deal, onCopy }: EmailDraftTabProps) {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const accountName = deal.company || deal.dealName;

  const { data: actionsData } = useQuery({
    queryKey: ["actions"],
    queryFn: () => api.getActions(),
    staleTime: 5000,
  });

  const draftAction = actionsData?.actions?.find(
    (a) =>
      a.type === "DRAFT_EMAIL" &&
      (a.accountName === accountName || a.payload?.dealId === deal.dealId)
  );

  const isAlreadyExecuted = draftAction?.status === "EXECUTED";

  const subject =
    (deal.aiInsights as any)?.followUpEmail?.subject ||
    `Confirming our upcoming call and next steps for ${deal.company || "your"} proposal`;

  const body =
    (deal.aiInsights as any)?.followUpEmail?.body ||
    `Hi ${deal.company ? deal.company + " Team" : "there"},

I hope your week is going well.

I wanted to quickly follow up on our previous conversation regarding the proposal. We've been reviewing your requirements and want to make sure we're fully aligned on your timeline and next steps.

Do you have 10–15 minutes this week for a brief check-in to confirm the milestones?

Looking forward to connecting soon!

Best regards,
Parthika Mahajan
Revenue Operations`;

  const handleCopy = () => {
    onCopy(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const res = await api.sendFollowUpEmail({
        dealId: deal.dealId || undefined,
        accountName,
        subject,
        body,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["actions"] }),
        queryClient.invalidateQueries({ queryKey: ["latest-analysis"] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ["actions"] });

      toast(
        "Email Sent Successfully",
        res.execution?.message || "Follow-up email has been sent to client and removed from pending queue.",
        "success"
      );
      setIsSent(true);
    } catch (err: any) {
      toast("Failed to Send Email", err.message || "An unexpected error occurred.", "error");
    } finally {
      setIsSending(false);
    }
  };

  if (isSent || isAlreadyExecuted) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Follow-up Email Sent to Client</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              This follow-up email has been approved and delivered to the client. This action has been completed and is no longer pending in the review list.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sent & Executed</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Suggested Follow-up Email</h3>
            <p className="text-xs text-slate-500">
              AI-generated re-engagement draft tailored to this account's deal stage.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Ready to Send</span>
          </span>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Subject Line
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
            {subject}
          </div>
        </div>

        {/* Email Body */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Email Body
          </label>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans whitespace-pre-line leading-relaxed">
            {body}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Draft</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendEmail}
            disabled={isSending}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A4330] hover:bg-[#30241D] disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md shadow-[#5A4330]/20 transition-all cursor-pointer"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Email...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}