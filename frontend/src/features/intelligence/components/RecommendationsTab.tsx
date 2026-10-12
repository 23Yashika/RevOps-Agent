"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { DealAnalysis } from "@/types";

interface RecommendationsTabProps {
  deal: DealAnalysis;
  onGoToEmail?: () => void;
}

export function RecommendationsTab({ deal }: RecommendationsTabProps) {
  const accountName = deal.company || deal.dealName;

  const { data: actionsData } = useQuery({
    queryKey: ["actions"],
    queryFn: () => api.getActions(),
    staleTime: 5000,
  });

  const emailAction = actionsData?.actions?.find(
    (a) =>
      a.type === "DRAFT_EMAIL" &&
      (a.accountName === accountName || a.payload?.dealId === deal.dealId)
  );

  const isEmailExecuted = emailAction?.status === "EXECUTED";

  const nextAction =
    deal.aiInsights?.nextBestAction ||
    "Send a concise follow-up email to the primary contact proposing a specific time for a call to address concerns and define next steps.";

  const clientEmail =
    (deal as any)?.primaryContact?.email ||
    emailAction?.payload?.to ||
    "radspatidar16@gmail.com";

  // If email was already executed/sent, show confirmed completed view
  if (isEmailExecuted) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recommended Action Completed</h3>
                <p className="text-xs text-slate-500">Autonomous revenue workflow executed for this deal</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Status: EXECUTED
            </span>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-emerald-900">
              Follow-up email has been approved and successfully delivered to the client ({clientEmail}).
            </p>
            <p className="text-xs text-emerald-700">
              This action has been executed and recorded in the audit history.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/approvals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-brown-600 hover:text-dark-brown-800"
            >
              <span>View Execution History in Approval Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Single Main Recommended Action Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pageBg text-[#6C3BDB]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Next Action</h3>
              <p className="text-xs text-slate-500">Autonomous workflow proposed by AI based on deal evidence</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Human Review</span>
          </span>
        </div>

        {/* Overview & Rationale */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account
            </h4>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {deal.company || deal.dealName}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI Strategy Justification
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              {nextAction}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 mt-2 mb-2 flex items-center bg-white justify-end">
          <Link
            href="/approvals"
            className="inline-flex text-white items-center bg-[#6C3BDB] hover:bg-[#171525] gap-2 px-5 py-2.5  rounded-xl text-xs font-semibold shadow-md shadow-dark-purple-500/20 transition-all cursor-pointer"
          >
            <span>View Recommended Actions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}