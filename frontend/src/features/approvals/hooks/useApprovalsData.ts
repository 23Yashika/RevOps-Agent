"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/providers/toast-provider";
import type { ProposedAction, ActionStatus } from "@/types";

export type ApprovalTab = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED";

export function useApprovalsData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<ApprovalTab>("PENDING");
  const [detailAction, setDetailAction] = useState<ProposedAction | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    action: ProposedAction;
    type: "APPROVE" | "REJECT" | "EXECUTE";
  } | null>(null);

  // 1. Fetch Actions
  const {
    data: actionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["actions"],
    queryFn: () => api.getActions(undefined, 100),
    staleTime: 1000 * 30, // 30 seconds
  });

  const actions: ProposedAction[] = actionsData?.actions ?? [];

  // Group actions by status
  const pendingActions = actions.filter((a) => a.status === "PENDING");
  const approvedActions = actions.filter((a) => a.status === "APPROVED");
  const rejectedActions = actions.filter((a) => a.status === "REJECTED");
  const executedActions = actions.filter(
    (a) => a.status === "EXECUTED" || a.status === "EXECUTING"
  );

  const displayedActions =
    selectedTab === "PENDING"
      ? pendingActions
      : selectedTab === "APPROVED"
      ? approvedActions
      : selectedTab === "REJECTED"
      ? rejectedActions
      : executedActions;

  // 2. Approve Mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.approveAction(id, "Parthika Mahajan (Reviewer)", note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["latest-analysis"] });
      setConfirmDialog(null);
      toast(
        "Action Approved",
        `Action for ${data.action.accountName} has been approved.`,
        "success"
      );
    },
    onError: (err: any) => {
      toast("Approval Failed", err.message || "Could not approve action.", "error");
    },
  });

  // 3. Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.rejectAction(id, "Parthika Mahajan (Reviewer)", note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      queryClient.invalidateQueries({ queryKey: ["latest-analysis"] });
      setConfirmDialog(null);
      toast(
        "Action Rejected",
        `Action for ${data.action.accountName} has been rejected.`,
        "warning"
      );
    },
    onError: (err: any) => {
      toast("Rejection Failed", err.message || "Could not reject action.", "error");
    },
  });

  // 4. Execute Mutation (Dry Run)
  const executeMutation = useMutation({
    mutationFn: (id: string) =>
      api.executeAction(id, "Parthika Mahajan (Reviewer)"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["actions"] });
      setConfirmDialog(null);
      toast(
        "Action Executed (Dry Run)",
        data.message || `Dry run completed for ${data.action.accountName}.`,
        "success"
      );
    },
    onError: (err: any) => {
      toast("Execution Failed", err.message || "Could not execute action.", "error");
    },
  });

  return {
    actions,
    displayedActions,
    selectedTab,
    setSelectedTab,
    pendingCount: pendingActions.length,
    approvedCount: approvedActions.length,
    rejectedCount: rejectedActions.length,
    executedCount: executedActions.length,
    detailAction,
    setDetailAction,
    confirmDialog,
    setConfirmDialog,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting:
      approveMutation.isPending ||
      rejectMutation.isPending ||
      executeMutation.isPending,
    handleApprove: (id: string, note?: string) =>
      approveMutation.mutate({ id, note }),
    handleReject: (id: string, note?: string) =>
      rejectMutation.mutate({ id, note }),
    handleExecute: (id: string) => executeMutation.mutate(id),
  };
}