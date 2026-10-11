"use client";

import React from "react";
import { DollarSign,IndianRupeeIcon, AlertTriangle, ShieldCheck, Clock, CheckCircle2, Building2, IndianRupee } from "lucide-react";
import type { DealAnalysis } from "@/types";

interface OverviewTabProps {
  deal: DealAnalysis;
  onGoToRecommendations: () => void;
}

export function OverviewTab({ deal, onGoToRecommendations }: OverviewTabProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(deal.amount);

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Deal Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Deal Value</span>
            <IndianRupee className="w-4 h-4 text-dark-brown-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{formattedAmount}</p>
          <p className="text-xs text-slate-400 mt-1">Stage: {deal.stage}</p>
        </div>

        {/* Metric 2: Risk Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Risk Score</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {deal.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </p>
          <p className="text-xs font-medium text-amber-600 mt-1 uppercase">
            {deal.riskLevel} Risk Profile
          </p>
        </div>

        {/* Metric 3: Target Close Date */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Close</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {deal.closeDate || "Not Scheduled"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {deal.closeDate ? "Tracked in CRM" : "Needs scheduling"}
          </p>
        </div>
      </div>

      {/* Recommended Action Callout Banner */}
      {deal.recommendations?.length > 0 && (
        <div className="bg-gradient-to-r from-dark-brown-50 to-indigo-50 border border-dark-brown-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-dark-brown-600 text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Recommended Next Action</h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                {deal.recommendations[0]}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToRecommendations}
            className="px-4 py-2 bg-dark-brown-600 hover:bg-dark-brown-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Review Action
          </button>
        </div>
      )}

      {/* Signal Health Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Data Coverage Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">HubSpot CRM</span>
            <p className="font-bold text-slate-800">
              {deal.dataCoverage?.companyMatched ? "Account Linked" : "No Company Linked"}
            </p>
            <p className="text-slate-500">
              {deal.dataCoverage?.associatedContacts || 0} associated contact(s)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Gmail Messages</span>
            <p className="font-bold text-slate-800">
              {deal.dataCoverage?.matchingEmails || 0} Matched Email(s)
            </p>
            <p className="text-slate-500">
              {deal.matchedEmails?.some((e) => e.demo) ? "Demo synthetic records" : "Live inbox search"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Google Calendar</span>
            <p className="font-bold text-slate-800">
              {deal.dataCoverage?.matchingEvents || 0} Matched Meeting(s)
            </p>
            <p className="text-slate-500">
              {deal.matchedEvents?.some((e) => e.demo) ? "Demo synthetic meetings" : "Live calendar search"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}