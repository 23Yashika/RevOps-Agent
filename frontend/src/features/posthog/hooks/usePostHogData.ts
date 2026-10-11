"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface PostHogTrendPoint {
  date: string;
  activeUsers: number;
  featureAdoption: number;
}

export interface PostHogSignal {
  id: string;
  type: "DECREASED_USAGE" | "INACTIVE_USERS" | "NEW_ADOPTION";
  title: string;
  account: string;
  severity: "high" | "medium" | "low";
}

export function usePostHogData() {
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch real status and analytics from backend
  const { data, isLoading } = useQuery({
    queryKey: ["posthog-real-data"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/posthog/analytics");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isConnected = Boolean(data?.connected);

  const fallbackKpis = {
    activeUsers: 1248,
    activeUsersChange: "+12%",
    featureAdoption: 34,
    featureAdoptionChange: "+5%",
    decliningAccounts: 2,
    decliningChange: "-18%",
    topFeatureGrowth: "+24%",
    topFeatureName: "Reports",
  };

  const fallbackTrends: PostHogTrendPoint[] = [
    { date: "Oct 6", activeUsers: 920, featureAdoption: 28 },
    { date: "Oct 7", activeUsers: 1040, featureAdoption: 30 },
    { date: "Oct 8", activeUsers: 990, featureAdoption: 29 },
    { date: "Oct 9", activeUsers: 1150, featureAdoption: 32 },
    { date: "Oct 10", activeUsers: 1248, featureAdoption: 34 },
  ];

  const fallbackSignals: PostHogSignal[] = [
    {
      id: "sig-1",
      type: "DECREASED_USAGE",
      title: "Decreased feature usage",
      account: "Acme",
      severity: "high",
    },
    {
      id: "sig-2",
      type: "INACTIVE_USERS",
      title: "Inactive users",
      account: "Globex",
      severity: "medium",
    },
    {
      id: "sig-3",
      type: "NEW_ADOPTION",
      title: "New feature adoption",
      account: "Initech",
      severity: "low",
    },
  ];

  return {
    isConnected,
    previewMode,
    setPreviewMode,
    kpis: data?.kpis ?? fallbackKpis,
    trendData: data?.trendData ?? fallbackTrends,
    signals: data?.signals ?? fallbackSignals,
    isLoading,
  };
}