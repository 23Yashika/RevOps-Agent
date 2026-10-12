"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { PostHogSignal, PostHogTrendPoint } from "@/features/posthog/hooks/usePostHogData";

import { usePostHogData } from "@/features/posthog/hooks/usePostHogData";
import { PostHogKpis } from "@/features/posthog/components/PostHogKpis";
import { UsageTrendsChart } from "@/features/posthog/components/UsageTrendsChart";
import { TopSignals } from "@/features/posthog/components/TopSignals";
// import { RiskDistributionOverview } from "@/features/posthog/components/RiskDistributionOverview";
// Replace RiskDistributionDonut import
// Account Health now uses the same overview component as dashboard
// Account Health now uses the same overview component as dashboard
// import { RiskDistributionDonut } from "@/features/posthog/components/RiskDistributionDonut";

// import { FeatureAdoptionBarChart } from "@/features/posthog/components/FeatureAdoptionBarChart";
// import { WeeklyActivityHeatmap } from "@/features/posthog/components/WeeklyActivityHeatmap";
// import { UserJourneyFunnel } from "@/features/posthog/components/UserJourneyFunnel";
// import { ArrowRight } from "lucide-react";

export default function PostHogPage() {
  const { isConnected, kpis, trendData, signals, isLoading } = usePostHogData();

  // Filter top signals to the required three cards
  const filteredSignals = signals.filter((sig: PostHogSignal) =>
    ["Decreased feature usage", "Inactive users", "New feature adoption"].includes(sig.title)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="PostHog Analytics"
        subtitle="Product usage insights and behavioral telemetry signals."
        action={
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-emerald-500"}`}
            />
            <span>{isConnected ? "Connected" : "Live"}</span>
          </div>
        }
      />

      {/* KPI Cards */}
      <PostHogKpis kpis={kpis} />

      {/* Usage Trends – Large Line Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Usage Trends</h3>
        <UsageTrendsChart data={trendData} />
      </div>

      {/* Feature Adoption by Module – Bar Chart */}
      {/* <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Feature Adoption by Module</h3>
        <FeatureAdoptionBarChart kpis={kpis} />
      </div> */}

      {/* Account Health – Donut Chart */}
      {/* <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Account Health</h3>
        <RiskDistributionOverview signals={signals} />
      </div> */}

      {/* Weekly Activity Heatmap */}
      {/* <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-700 mb-2">Weekly Activity Heatmap</h3>
        <WeeklyActivityHeatmap data={trendData && trendData.length ? trendData.map((t: PostHogTrendPoint, i: number) => ({ day: `Day ${i+1}`, value: Math.round(t.activeUsers/100) })) : [{ day: "Mon", value: 8 }, { day: "Tue", value: 12 }, { day: "Wed", value: 5 }, { day: "Thu", value: 9 }, { day: "Fri", value: 7 }, { day: "Sat", value: 3 }, { day: "Sun", value: 4 }]} />
      </div> */}

      {/* User Journey Funnel */}
      {/* <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-700 mb-2">User Journey Funnel</h3>
        <UserJourneyFunnel data={trendData && trendData.length ? trendData.map((t: PostHogTrendPoint, i: number) => ({ stage: `Stage ${i+1}`, value: Math.round(t.activeUsers/10) })) : [{ stage: "Acquisition", value: 1500 }, { stage: "Activation", value: 1200 }, { stage: "Retention", value: 900 }, { stage: "Revenue", value: 600 }]} />
      </div> */}

      {/* Top Signals – limited to three cards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <TopSignals signals={filteredSignals} />
      </div>
    </div>
  );
}