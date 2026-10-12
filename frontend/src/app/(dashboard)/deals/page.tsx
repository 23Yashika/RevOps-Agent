"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { useDealsData } from "@/features/deals/hooks/useDealsData";
import { DealsFilters } from "@/features/deals/components/DealsFilters";
import { DealsTable } from "@/features/deals/components/DealsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function DealsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch?.();
      setLastUpdated(new Date());
      toast('Data refreshed successfully', undefined, 'success');
    } catch (err) {
      toast('Refresh failed', (err as any)?.message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };
  const {
    deals,
    totalCount,
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
  } = useDealsData();

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRisk("ALL");
    setSelectedStage("ALL");
    setSelectedCoverage("ALL");
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Header
          title="Deals & Accounts"
          subtitle="Browse and manage all accounts and deals with real-time risk scores and filters."
        />
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-14 w-full" />
          <LoadingSkeleton className="h-14 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <Header
        title="Deals & Accounts"
        subtitle="Browse and manage all accounts and deals with real-time risk scores and filters."
        action={
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            {lastUpdated && (
              <span className="text-xs text-slate-500 ml-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </button>
        }
      />

      {/* 2. Filter & Search Toolbar */}
      <DealsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRisk={selectedRisk}
        onRiskChange={setSelectedRisk}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        selectedCoverage={selectedCoverage}
        onCoverageChange={setSelectedCoverage}
        stages={stages}
        onReset={handleResetFilters}
      />

      {/* 3. Main Table / Empty / Loading States */}
      {isLoading ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-14 w-full" />
          <LoadingSkeleton className="h-14 w-full" />
          <LoadingSkeleton className="h-14 w-full" />
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="font-bold text-rose-900 text-sm">Failed to load deals</h3>
          <p className="text-xs text-rose-700 mt-1 mb-4">
            {(error as any)?.message || "Could not retrieve deals from the backend."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : deals.length > 0 ? (
        <DealsTable
          deals={deals}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={toggleSort}
        />
      ) : (
        <EmptyState
          title="No matching deals found"
          description={
            totalCount === 0
              ? "No deals currently analyzed. Run an AI analysis from the Overview dashboard."
              : "No deals match your active search or filter criteria. Try resetting filters."
          }
          action={
            totalCount > 0 ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-dark-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-dark-purple-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}