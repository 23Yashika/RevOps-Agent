"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building } from "lucide-react";
import { RiskBadge } from "@/components/shared/RiskBadge";
import type { DealAnalysis } from "@/types";

interface TopAccountsByRiskProps {
  deals: DealAnalysis[];
}

export function TopAccountsByRisk({ deals }: TopAccountsByRiskProps) {
  const sortedDeals = [...deals].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Top Accounts by Risk</h3>
          <p className="text-xs text-slate-500">Accounts needing executive attention</p>
        </div>
        <Link
          href="/deals"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-slate-100 py-2">
        {sortedDeals.length > 0 ? (
          sortedDeals.map((deal) => {
            const dealId = deal.dealId || "deal-1";
            return (
              <div
                key={dealId}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {deal.company || deal.dealName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {deal.stage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <RiskBadge level={deal.riskLevel} score={deal.riskScore} />
                  <Link
                    href={`/intelligence/${dealId}`}
                    className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View Deal Intelligence"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400">
              No analyzed deals yet. Click "Run AI Analysis" to evaluate risk scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}