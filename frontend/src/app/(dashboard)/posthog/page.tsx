"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { usePostHogData } from "@/features/posthog/hooks/usePostHogData";
import { PostHogKpis } from "@/features/posthog/components/PostHogKpis";
import { UsageTrendsChart } from "@/features/posthog/components/UsageTrendsChart";
import { TopSignals } from "@/features/posthog/components/TopSignals";

export default function PostHogPage() {
  const {
    isConnected,
    kpis,
    trendData,
    signals,
  } = usePostHogData();

  return (
    <div className="space-y-6">
      {/* 1. Header with Status Badge */}
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
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-emerald-500"
              }`}
            />
            <span>{isConnected ? "Connected" : "Live"}</span>
          </div>
        }
      />

      {/* 2. Analytics Display */}
      <div className="space-y-6">
        {/* KPI Cards */}
        <PostHogKpis kpis={kpis} />

        {/* Charts & Behavioral Signals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UsageTrendsChart data={trendData} />
          </div>
          <div>
            <TopSignals signals={signals} />
          </div>
        </div>
      </div>
    </div>
  );
}