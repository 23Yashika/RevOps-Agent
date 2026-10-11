"use client";

import React, { useState } from "react";
import { Copy, Check, Mail, Sparkles } from "lucide-react";
import type { DealAnalysis } from "@/types";

interface EmailDraftTabProps {
  deal: DealAnalysis;
  onCopy: (text: string) => void;
}

export function EmailDraftTab({ deal, onCopy }: EmailDraftTabProps) {
  const [copied, setCopied] = useState(false);

  const subject = `Confirming our upcoming call and next steps for ${deal.company || "your"} proposal`;

  const body = `Hi ${deal.company ? deal.company + " Team" : "there"},

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
        <div className="pt-2 flex justify-end">
          <button
  onClick={handleCopy}
  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5A4330] hover:bg-[#30241D] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#5A4330]/20 transition-all cursor-pointer"
>
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Draft</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}