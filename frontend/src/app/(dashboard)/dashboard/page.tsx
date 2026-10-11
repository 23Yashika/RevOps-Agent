"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sparkles, Loader2 } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { KpiCards } from "@/features/dashboard/components/KpiCards";
import { RiskDistributionChart } from "@/features/dashboard/components/RiskDistributionChart";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { TopAccountsByRisk } from "@/features/dashboard/components/TopAccountsByRisk";
import { IntegrationHealthBanner } from "@/features/dashboard/components/IntegrationHealthBanner";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";

export default function DashboardPage() {
  const {
    actions,
    pendingActionsCount,
    analysis,
    totalPipeline,
    dealsAnalyzedCount,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    googleStatus,
    isLoading,
    isAnalyzing,
    runAnalysis,
    lastAnalysisTime,
  } = useDashboardData();

  const isGoogleConnected = Boolean(googleStatus?.connected);

  const runAnalysisButton = (
    <button
      onClick={runAnalysis}
      disabled={isAnalyzing}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primaryAction hover:bg-primaryDarkBrown disabled:opacity-70 text-cardBg text-xs font-semibold shadow-md transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagneGold cursor-pointer"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Analyzing Pipeline...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 text-white" />
          <span>Run AI Analysis</span>
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <Header
        title="Good morning, Parthika!"
        subtitle="Here's what's happening with your revenue pipeline today."
        action={runAnalysisButton}
        lastAnalysisAt={lastAnalysisTime || undefined}
      />

      {/* 2. KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <KpiCards
          totalPipeline={totalPipeline}
          dealsAnalyzed={dealsAnalyzedCount}
          pendingActions={pendingActionsCount}
          highRiskDeals={highRiskCount}
        />
      )}

      {/* 3. Analytics Grid (Risk Distribution, Recent Activity, Top Accounts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RiskDistributionChart
          lowCount={lowRiskCount}
          mediumCount={mediumRiskCount}
          highCount={highRiskCount}
          totalDeals={dealsAnalyzedCount}
        />

        <RecentActivity
          actions={actions}
          lastAnalysisTime={lastAnalysisTime}
          hubspotConnected={true}
          gmailConnected={isGoogleConnected}
        />

         <TopAccountsByRisk deals={analysis?.deals ?? []} /> 
      </div>

      {/* 4. Integration Health Summary Banner */}
      <IntegrationHealthBanner
        hubspotConnected={true}
        gmailConnected={isGoogleConnected}
        calendarConnected={isGoogleConnected}
      />
    </div>
  );
}