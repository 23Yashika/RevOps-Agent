"use client";

import React from "react";
import { Sparkles, BrainCircuit, CheckCircle2, AlertCircle } from "lucide-react";
import type { DealAnalysis } from "@/types";

interface AiInsightsTabProps {
  deal: DealAnalysis;
  aiModel: string;
}

export function AiInsightsTab({ deal, aiModel }: AiInsightsTabProps) {
  const insights = deal.aiInsights;

  return (
    <div className="space-y-6">
      {/* Groq AI Badge Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">AI Reasoning Engine</h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Powered by Groq Cloud · Model: <span className="font-mono text-white font-semibold">{aiModel}</span>
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Analysis Generated</span>
        </span>
      </div>

      {/* Risk Explanation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Risk Explanation
        </h4>
        <p className="text-sm text-slate-800 leading-relaxed font-medium">
          {insights?.riskExplanation ||
            deal.evidence?.join(" ") ||
            "The deal may be stalled due to lack of response on follow-ups and limited engagement signals."}
        </p>
      </div>

      {/* Key Findings Bullet List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Key Findings
        </h4>
        <div className="space-y-2.5">
          {insights?.keyFindings && insights.keyFindings.length > 0 ? (
            insights.keyFindings.map((finding, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{finding}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-start gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                <span>Stage indicates potential stalled deal.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                <span>Follow-up emails sent with no response recorded in recent timeline.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                <span>Only 1 associated contact and 1 meeting scheduled.</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Next Best Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Next Best Action
        </h4>
        <p className="text-xs text-slate-800 font-semibold">
          {insights?.nextBestAction ||
            deal.recommendations?.[0] ||
            "Review last interaction and agree on a concrete next step with the account executive."}
        </p>
      </div>
    </div>
  );
}