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

    onSuccess: async (data) => {
      const result = data as typeof data & {
        execution?: {
          dryRun?: boolean;
          message?: string;
        };
      };

      setConfirmDialog(null);

      // Refresh status counts and action cards after every approval.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["actions"] }),
        queryClient.invalidateQueries({ queryKey: ["latest-analysis"] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ["actions"], type: "active" });

      if (data.action.type === "DRAFT_EMAIL") {
        if (
          data.action.status === "EXECUTED" &&
          result.execution?.dryRun === false
        ) {
          toast(
            "Email sent",
            result.execution.message || "Gmail accepted the email for sending.",
            "success"
          );
        } else if (
          data.action.status === "EXECUTED" &&
          result.execution?.dryRun === true
        ) {
          toast(
            "Dry run only",
            "The action was simulated. No email was sent.",
            "warning"
          );
        } else {
          toast(
            "Email not confirmed",
            result.execution?.message ||
              `The action status is ${data.action.status}. Check the action details before retrying.`,
            "warning"
          );
        }
        return;
      }

      toast(
        "Action Approved",
        `Action for ${data.action.accountName} has been approved.`,
        "success"
      );
    },

    onError: async (err: any) => {
      await queryClient.invalidateQueries({ queryKey: ["actions"] });
      await queryClient.refetchQueries({ queryKey: ["actions"], type: "active" });

      toast(
        "Approval or execution failed",
        err.message ||
          "The result may be uncertain. Check the action status before retrying.",
        "error"
      );
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
