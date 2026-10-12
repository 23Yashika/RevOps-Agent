"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { RefreshCw, CheckSquare, AlertCircle } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { useApprovalsData, type ApprovalTab } from "@/features/approvals/hooks/useApprovalsData";
import { ActionCard } from "@/features/approvals/components/ActionCard";
import { ActionDetailModal } from "@/features/approvals/components/ActionDetailModal";
import { ActionConfirmDialog } from "@/features/approvals/components/ActionConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const {
    displayedActions,
    selectedTab,
    setSelectedTab,
    pendingCount,
    approvedCount,
    rejectedCount,
    executedCount,
    detailAction,
    setDetailAction,
    confirmDialog,
    setConfirmDialog,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting,
    handleApprove,
    handleReject,
    handleExecute,
  } = useApprovalsData();

  const TABS: { id: ApprovalTab; label: string; count: number }[] = [
    { id: "PENDING", label: "Pending", count: pendingCount },
    { id: "APPROVED", label: "Approved", count: approvedCount },
    { id: "REJECTED", label: "Rejected", count: rejectedCount },
    { id: "EXECUTED", label: "Executed", count: executedCount },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <Header
        title="Approval Center"
        subtitle="Review proposed revenue actions, approve/reject, and inspect underlying evidence."
        action={
          <button
            onClick={async () => {
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
            }}
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

      {/* 2. Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {TABS.map((tab) => {
          const active = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${active
                ? "border-dark-brown-600 text-dark-brown-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${active
                  ? "bg-dark-brown-50 text-dark-brown-700"
                  : "bg-slate-100 text-slate-600"
                  }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Action Cards Feed */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton className="h-40 w-full rounded-2xl" />
          <LoadingSkeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="font-bold text-rose-900 text-sm">Failed to load actions</h3>
          <p className="text-xs text-rose-700 mt-1 mb-4">
            {(error as any)?.message || "Could not retrieve proposed actions."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : displayedActions.length > 0 ? (
        <div className="space-y-4">
          {displayedActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onViewDetails={(a) => setDetailAction(a)}
              onApprove={(a) => setConfirmDialog({ action: a, type: "APPROVE" })}
              onReject={(a) => setConfirmDialog({ action: a, type: "REJECT" })}
              onExecute={(a) => setConfirmDialog({ action: a, type: "EXECUTE" })}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${selectedTab.toLowerCase()} actions`}
          description={
            selectedTab === "PENDING"
              ? "All actions have been reviewed! Click 'Run AI Analysis' on the Overview dashboard to evaluate new deals."
              : `There are currently no actions in ${selectedTab.toLowerCase()} status.`
          }
          icon={<CheckSquare className="w-8 h-8 text-slate-400" />}
        />
      )}

      {/* 4. Inspection Modal */}
      <ActionDetailModal
        action={detailAction}
        onClose={() => setDetailAction(null)}
      />

      {/* 5. Safe Confirmation Dialog */}
      <ActionConfirmDialog
        dialog={confirmDialog}
        isSubmitting={isSubmitting}
        onClose={() => setConfirmDialog(null)}
        onConfirmApprove={handleApprove}
        onConfirmReject={handleReject}
        onConfirmExecute={handleExecute}
      />
    </div>
  );
}