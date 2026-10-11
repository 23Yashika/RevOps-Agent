"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/providers/toast-provider";
import type { AnalysisResponse } from "@/types";

export function useDashboardData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1. Fetch Existing Actions (Read-only, safe, fast)
  const actionsQuery = useQuery({
    queryKey: ["actions"],
    queryFn: () => api.getActions(undefined, 50),
  });

  // 2. Fetch Google Connection Status
  const googleStatusQuery = useQuery({
    queryKey: ["google-status"],
    queryFn: () => api.getGoogleStatus(),
  });

  // 3. Cached Analysis Data
  const analysisQuery = useQuery<AnalysisResponse | null>({
    queryKey: ["latest-analysis"],
    queryFn: async () => {
      // Check query cache first without re-triggering analysis
      const cached = queryClient.getQueryData<AnalysisResponse>(["latest-analysis"]);
      return cached ?? null;
    },
    staleTime: Infinity, // Keep in memory until manually refetched
  });

  // 4. Mutation to Run AI Analysis on explicit user click
  const runAnalysisMutation = useMutation({
    mutationFn: () => api.getAnalysis(10),
    onSuccess: (data) => {
      queryClient.setQueryData(["latest-analysis"], data);
      // Invalidate actions query to pick up newly created proposed actions
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      toast(
        "AI Analysis Complete",
        `Evaluated ${data.deals.length} deals using Groq (${data.ai?.model || "Llama 3.3"}).`,
        "success"
      );
    },
    onError: (error: any) => {
      toast(
        "Analysis Failed",
        error.message || "Failed to communicate with the AI engine.",
        "error"
      );
    },
  });

  const actions = actionsQuery.data?.actions ?? [];
  const pendingActions = actions.filter((a) => a.status === "PENDING");
  const analysis = analysisQuery.data;

  // Compute Total Pipeline Value
  const totalPipeline = analysis?.deals?.reduce(
    (sum, deal) => sum + (deal.amount || 0),
    0
  ) ?? 0;

  // Counts
  const dealsAnalyzedCount = analysis?.deals?.length ?? 0;
  const highRiskCount =
    analysis?.summary?.highRiskDeals ??
    analysis?.deals?.filter((d) => d.riskLevel === "high").length ??
    0;
  const mediumRiskCount =
    analysis?.summary?.mediumRiskDeals ??
    analysis?.deals?.filter((d) => d.riskLevel === "medium").length ??
    0;
  const lowRiskCount =
    analysis?.summary?.lowRiskDeals ??
    analysis?.deals?.filter((d) => d.riskLevel === "low").length ??
    0;

  return {
    actions,
    pendingActions,
    pendingActionsCount: pendingActions.length,
    analysis,
    totalPipeline,
    dealsAnalyzedCount,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    googleStatus: googleStatusQuery.data,
    isLoading: actionsQuery.isLoading || googleStatusQuery.isLoading,
    isAnalyzing: runAnalysisMutation.isPending,
    runAnalysis: () => runAnalysisMutation.mutate(),
    lastAnalysisTime: analysis?.generatedAt
      ? new Date(analysis.generatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          day: "numeric",
        })
      : null,
  };
}