"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useDealIntelligence } from "@/features/intelligence/hooks/useDealIntelligence";
import { IntelligenceHeader } from "@/features/intelligence/components/IntelligenceHeader";
import { OverviewTab } from "@/features/intelligence/components/OverviewTab";
import { EvidenceTab } from "@/features/intelligence/components/EvidenceTab";
import { EvidenceModal } from "@/features/intelligence/components/EvidenceModal";
import { AiInsightsTab } from "@/features/intelligence/components/AiInsightsTab";
import { RecommendationsTab } from "@/features/intelligence/components/RecommendationsTab";
import { EmailDraftTab } from "@/features/intelligence/components/EmailDraftTab";
import { HistoryTab } from "@/features/intelligence/components/HistoryTab";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function IntelligencePage() {
  const params = useParams();
  const dealId = (params?.dealId as string) || "deal-1";

  const {
    deal,
    activeTab,
    setActiveTab,
    selectedEvidence,
    setSelectedEvidence,
    analysisRunId,
    generatedAt,
    aiModel,
    isLoading,
    copyToClipboard,
  } = useDealIntelligence(dealId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <LoadingSkeleton className="h-12 w-full rounded-2xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Deal Not Found"
          description="Could not find analysis records for this deal ID. Try returning to the Deals table."
          action={
            <Link
              href="/deals"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-dark-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-dark-purple-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Deals</span>
            </Link>
          }
        />
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "Evidence" },
    { id: "insights", label: "AI Insights" },
    { id: "recommendations", label: "Recommendations" },
    { id: "email", label: "Follow-up Email" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <IntelligenceHeader deal={deal} />

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${active
                ? "border-dark-purple-600 text-[#6C3BDB] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "overview" && (
        <OverviewTab
          deal={deal}
          onGoToRecommendations={() => setActiveTab("recommendations")}
        />
      )}

      {activeTab === "evidence" && (
        <EvidenceTab
          deal={deal}
          onViewEvidence={(ev) => setSelectedEvidence(ev)}
        />
      )}

      {activeTab === "insights" && (
        <AiInsightsTab deal={deal} aiModel={aiModel} />
      )}

      {activeTab === "recommendations" && (
        <RecommendationsTab deal={deal} />
      )}

      {activeTab === "email" && (
        <EmailDraftTab deal={deal} onCopy={copyToClipboard} />
      )}

      {activeTab === "history" && (
        <HistoryTab
          analysisRunId={analysisRunId}
          generatedAt={generatedAt}
          aiModel={aiModel}
        />
      )}

      {/* 4. Evidence Inspection Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}