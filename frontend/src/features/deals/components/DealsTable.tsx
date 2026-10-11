"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpDown, Building, ChevronRight, Calendar } from "lucide-react";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { DataCoverageBadge } from "./DataCoverageBadge";
import type { DealAnalysis } from "@/types";
import type { SortField, SortOrder } from "../hooks/useDealsData";

interface DealsTableProps {
  deals: DealAnalysis[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function DealsTable({ deals, sortField, sortOrder, onSort }: DealsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Oct 10, 2026";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">
                <button
                  onClick={() => onSort("dealName")}
                  className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span>Company / Deal</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSort("amount")}
                  className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-4">Stage</th>
              <th className="py-3.5 px-4">
                <button
                  onClick={() => onSort("riskScore")}
                  className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-4">Last Activity</th>
              <th className="py-3.5 px-4">Coverage</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {deals.map((deal) => {
              const dealId = deal.dealId || "deal-1";
              return (
                <tr
                  key={dealId}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Company / Deal */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-dark-brown-50 text-dark-brown-600 flex items-center justify-center shrink-0 border border-dark-brown-100/60 font-semibold text-xs">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-dark-brown-600 transition-colors truncate">
                          {deal.company || deal.dealName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {deal.dealName} {deal.dealId && `· #${deal.dealId}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-bold text-slate-800 font-mono">
                    {formatCurrency(deal.amount)}
                  </td>

                  {/* Stage */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {deal.stage}
                    </span>
                  </td>

                  {/* Risk Score */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {deal.riskScore}
                      </span>
                      <RiskBadge level={deal.riskLevel} />
                    </div>
                  </td>

                  {/* Last Activity */}
                  <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(deal.closeDate)}</span>
                    </div>
                  </td>

                  {/* Coverage */}
                  <td className="py-4 px-4">
                    <DataCoverageBadge coverage={deal.dataCoverage} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <Link
                      href={`/intelligence/${dealId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-dark-brown-600 hover:text-white text-slate-700 text-xs font-semibold transition-all duration-150 shadow-xs cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <span className="font-semibold text-slate-700">{deals.length}</span> deals
        </span>
        <span className="text-[11px] text-slate-400">
          Click any row's "View Details" to inspect evidence and AI insights.
        </span>
      </div>
    </div>
  );
}
