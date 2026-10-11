"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { DealAnalysis, AnalysisResponse, RiskLevel } from "@/types";

export type SortField = "riskScore" | "amount" | "dealName";
export type SortOrder = "asc" | "desc";

export function useDealsData() {
  const queryClient = useQueryClient();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("ALL");
  const [sortField, setSortField] = useState<SortField>("riskScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Query: Get analysis deals (checks cache first, or fetches)
  const { data: analysisData, isLoading, isError, error, refetch } = useQuery<AnalysisResponse>({
    queryKey: ["latest-analysis"],
    queryFn: async () => {
      const cached = queryClient.getQueryData<AnalysisResponse>(["latest-analysis"]);
      if (cached) return cached;
      return api.getAnalysis(25);
    },
    staleTime: 1000 * 60 * 10,
  });

  const rawDeals: DealAnalysis[] = analysisData?.deals ?? [];

  // Extract unique stages for filter dropdown
  const stages = useMemo(() => {
    const set = new Set<string>();
    rawDeals.forEach((d) => {
      if (d.stage) set.add(d.stage);
    });
    return Array.from(set);
  }, [rawDeals]);

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    return rawDeals
      .filter((deal) => {
        // 1. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCompany = deal.company?.toLowerCase().includes(q);
          const matchDeal = deal.dealName.toLowerCase().includes(q);
          const matchId = deal.dealId?.toLowerCase().includes(q);
          if (!matchCompany && !matchDeal && !matchId) return false;
        }

        // 2. Risk Level Filter
        if (selectedRisk !== "ALL") {
          if (deal.riskLevel !== selectedRisk.toLowerCase()) return false;
        }

        // 3. Stage Filter
        if (selectedStage !== "ALL") {
          if (deal.stage !== selectedStage) return false;
        }

        // 4. Data Coverage Filter
        if (selectedCoverage === "FULL") {
          if (!deal.dataCoverage || deal.dataCoverage.matchingEmails === 0 || deal.dataCoverage.matchingEvents === 0) {
            return false;
          }
        } else if (selectedCoverage === "PARTIAL") {
          if (!deal.dataCoverage || (deal.dataCoverage.matchingEmails === 0 && deal.dataCoverage.matchingEvents === 0)) {
            return false;
          }
        } else if (selectedCoverage === "LOW") {
          if (deal.dataCoverage && (deal.dataCoverage.matchingEmails > 0 || deal.dataCoverage.matchingEvents > 0)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === "riskScore") {
          comp = a.riskScore - b.riskScore;
        } else if (sortField === "amount") {
          comp = a.amount - b.amount;
        } else if (sortField === "dealName") {
          comp = a.dealName.localeCompare(b.dealName);
        }
        return sortOrder === "desc" ? -comp : comp;
      });
  }, [rawDeals, searchQuery, selectedRisk, selectedStage, selectedCoverage, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return {
    deals: filteredDeals,
    totalCount: rawDeals.length,
    filteredCount: filteredDeals.length,
    stages,
    searchQuery,
    setSearchQuery,
    selectedRisk,
    setSelectedRisk,
    selectedStage,
    setSelectedStage,
    selectedCoverage,
    setSelectedCoverage,
    sortField,
    sortOrder,
    toggleSort,
    isLoading,
    isError,
    error,
    refetch,
    isAnalyzed: Boolean(analysisData),
  };
}
