"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import type { DealAnalysis } from "@/types";

interface RecommendationsTabProps {
  deal: DealAnalysis;
}

export function RecommendationsTab({ deal }: RecommendationsTabProps) {
  const recommendation =
    deal.recommendations?.[0] ||
    "Notify account owner and prepare a re-engagement proposal.";

  return (
    <div className="space-y-6">
      {/* Recommended Action Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pageBg text-[#6C3BDB]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Action</h3>
              <p className="text-xs text-slate-500">Autonomous revenue workflow proposed by AI</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Action: NOTIFY_OWNER
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Action Title
            </h4>
            <p className="text-sm font-bold text-slate-800 mt-1">
              Notify account owner about the stalled deal ({deal.company || deal.dealName})
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Risk Justification
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {recommendation}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 mt-2 mb-2 flex items-center bg-white justify-end">
          <Link
            href="/approvals"
            className="inline-flex text-white items-center bg-[#6C3BDB] hover:bg-[#171525] gap-2 px-5 py-2.5  rounded-xl text-xs font-semibold shadow-md shadow-dark-purple-500/20 transition-all cursor-pointer"
          >
            <span>Review in Approval Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}