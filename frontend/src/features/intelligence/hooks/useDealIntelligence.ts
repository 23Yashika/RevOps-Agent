"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/providers/toast-provider";
import type { DealAnalysis, AnalysisResponse } from "@/types";

export type IntelligenceTab =
  | "overview"
  | "evidence"
  | "insights"
  | "recommendations"
  | "email"
  | "history";

export function useDealIntelligence(dealId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<IntelligenceTab>("evidence");
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);

  // Fetch or retrieve from cache
  const { data: analysisData, isLoading, isError, error, refetch } = useQuery<AnalysisResponse>({
    queryKey: ["latest-analysis"],
    queryFn: async () => {
      const cached = queryClient.getQueryData<AnalysisResponse>(["latest-analysis"]);
      if (cached) return cached;
      return api.getAnalysis(25);
    },
    staleTime: 1000 * 60 * 10,
  });

  // Find the deal matching the URL parameter
  const deal: DealAnalysis | undefined = analysisData?.deals?.find(
    (d) => String(d.dealId) === String(dealId)
  ) || analysisData?.deals?.[0]; // Fallback to first deal for demo navigation

  // Copy helper for Email Draft
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to Clipboard", "Email draft copied. Ready to paste into Gmail or Outlook.", "success");
  };

  return {
    deal,
    activeTab,
    setActiveTab,
    selectedEvidence,
    setSelectedEvidence,
    analysisRunId: analysisData?.persistence?.analysisRunId || "run-latest",
    generatedAt: analysisData?.generatedAt || new Date().toISOString(),
    aiModel: analysisData?.ai?.model || "llama-3.3-70b-versatile",
    isLoading,
    isError,
    error,
    refetch,
    copyToClipboard,
  };
}