"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Building, DollarSign, Calendar, Sparkles } from "lucide-react";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { DataCoverageBadge } from "@/features/deals/components/DataCoverageBadge";
import type { DealAnalysis } from "@/types";

interface IntelligenceHeaderProps {
  deal: DealAnalysis;
}

export function IntelligenceHeader({ deal }: IntelligenceHeaderProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(deal.amount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Back Button */}
      <div>
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-dark-brown-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Deals</span>
        </Link>
      </div>

      {/* Main Deal Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-dark-brown-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-dark-brown-500/20">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {deal.company || deal.dealName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{deal.dealName}</span>
              <span>·</span>
              <span className="font-mono font-bold text-slate-900">{formattedAmount}</span>
              <span>·</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                {deal.stage}
              </span>
            </div>
          </div>
        </div>

        {/* Badges & Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <DataCoverageBadge coverage={deal.dataCoverage} />
          </div>
          <RiskBadge level={deal.riskLevel} score={deal.riskScore} className="px-3 py-1.5 text-xs" />
        </div>
      </div>
    </div>
  );
}