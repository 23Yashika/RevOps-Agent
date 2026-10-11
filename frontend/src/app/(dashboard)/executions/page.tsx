"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { RefreshCw, History, AlertCircle } from "lucide-react";
import { useExecutionsData } from "@/features/executions/hooks/useExecutionsData";
import { ExecutionsFilters } from "@/features/executions/components/ExecutionsFilters";
import { ExecutionsTable } from "@/features/executions/components/ExecutionsTable";
import { ExecutionTimeline } from "@/features/executions/components/ExecutionTimeline";
import { ExecutionLogsModal } from "@/features/executions/components/ExecutionLogsModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function ExecutionsPage() {
  const {
    actions,
    totalCount,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
    activeTimelineAction,
    setActiveTimelineAction,
    logsModalAction,
    setLogsModalAction,
    isLoading,
    isError,
    error,
    refetch,
  } = useExecutionsData();

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedType("ALL");
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <Header
        title="Execution History"
        subtitle="Track execution status, audit logs, and status transitions."
        action={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* 2. Filter Toolbar */}
      <ExecutionsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onReset={handleResetFilters}
      />

      {/* 3. Table / Empty / Loading */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-44 w-full rounded-2xl" />
          <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="font-bold text-rose-900 text-sm">
            Failed to load execution logs
          </h3>
          <p className="text-xs text-rose-700 mt-1 mb-4">
            {(error as any)?.message || "Could not retrieve audit history."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : actions.length > 0 ? (
        <div className="space-y-6">
          <ExecutionsTable
            actions={actions}
            activeActionId={activeTimelineAction?.id}
            onSelectAction={setActiveTimelineAction}
            onViewLogs={(a) => setLogsModalAction(a)}
          />

          {/* 4. Bottom Timeline & Audit Widget */}
          <ExecutionTimeline
            action={activeTimelineAction}
            onViewLogs={(a) => setLogsModalAction(a)}
          />
        </div>
      ) : (
        <EmptyState
          title="No execution records found"
          description={
            totalCount === 0
              ? "No actions have been executed yet. Approve and execute actions in the Approval Center."
              : "No actions match your active filter criteria. Try resetting filters."
          }
          icon={<History className="w-8 h-8 text-slate-400" />}
          action={
            totalCount > 0 ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : undefined
          }
        />
      )}

      {/* 5. Logs & Raw Payload Modal */}
      <ExecutionLogsModal
        action={logsModalAction}
        onClose={() => setLogsModalAction(null)}
      />
    </div>
  );
}