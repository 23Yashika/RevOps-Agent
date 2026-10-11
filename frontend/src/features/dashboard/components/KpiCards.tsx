"use client";

import React from "react";
import { DollarSign,IndianRupee , FileSpreadsheet, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface KpiCardsProps {
  totalPipeline: number;
  dealsAnalyzed: number;
  pendingActions: number;
  highRiskDeals: number;
}

export function KpiCards({
  totalPipeline,
  dealsAnalyzed,
  pendingActions,
  highRiskDeals,
}: KpiCardsProps) {
  const formattedPipeline = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPipeline);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pipeline */}
      <div className="bg-cardBg p-5 rounded-2xl border border-borderColor shadow-xs hover:border-borderColor/80 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </p>
          <div className="w-8 h-8 rounded-lg bg-lightSurface text-primaryDarkBrown flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {formattedPipeline}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span>↑ +12%</span>
            <span className="text-slate-400 font-normal">vs. last 7 days</span>
          </div>
        </div>
      </div>

      {/* 2. Deals Analyzed */}
      <div className="bg-cardBg p-5 rounded-2xl border border-borderColor shadow-xs hover:border-borderColor/80 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Deals Analyzed
          </p>
          <div className="w-8 h-8 rounded-lg bg-lightSurface text-primaryDarkBrown flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {dealsAnalyzed}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>+0%</span>
            <span className="text-slate-400 font-normal">vs. last 7 days</span>
          </div>
        </div>
      </div>

      {/* 3. Pending Actions */}
      <div className="bg-cardBg p-5 rounded-2xl border border-borderColor shadow-xs hover:border-borderColor/80 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Actions
          </p>
          <div className="w-8 h-8 rounded-lg bg-lightSurface text-primaryDarkBrown flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {pendingActions}
          </h3>
          <div className="mt-1">
            {pendingActions > 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                {pendingActions} need review
              </span>
            ) : (
              <span className="text-xs text-slate-400">No actions pending</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. High-Risk Deals */}
      <div className="bg-cardBg p-5 rounded-2xl border border-borderColor shadow-xs hover:border-borderColor/80 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            High-Risk Deals
          </p>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              highRiskDeals > 0
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {highRiskDeals > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {highRiskDeals}
          </h3>
          <div className="mt-1">
            {highRiskDeals === 0 ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                All clear
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Immediate attention
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}