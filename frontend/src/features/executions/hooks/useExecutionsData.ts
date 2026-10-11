"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ProposedAction, ActionStatus, ActionType } from "@/types";

export function useExecutionsData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedAction, setSelectedAction] = useState<ProposedAction | null>(null);
  const [logsModalAction, setLogsModalAction] = useState<ProposedAction | null>(null);

  // Fetch all actions
  const {
    data: actionsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["actions"],
    queryFn: () => api.getActions(undefined, 100),
    staleTime: 1000 * 30,
  });

  const rawActions: ProposedAction[] = actionsData?.actions ?? [];

  // Filter actions
  const filteredActions = useMemo(() => {
    return rawActions.filter((action) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAccount = action.accountName.toLowerCase().includes(q);
        const matchType = action.type.toLowerCase().includes(q);
        const matchId = action.id.toLowerCase().includes(q);
        if (!matchAccount && !matchType && !matchId) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== "ALL") {
        if (action.status !== selectedStatus) return false;
      }

      // 3. Action Type Filter
      if (selectedType !== "ALL") {
        if (action.type !== selectedType) return false;
      }

      return true;
    });
  }, [rawActions, searchQuery, selectedStatus, selectedType]);

  // Default selected action for the timeline widget
  const activeTimelineAction =
    selectedAction ||
    filteredActions.find((a) => a.status === "EXECUTED") ||
    filteredActions[0] ||
    null;

  return {
    actions: filteredActions,
    totalCount: rawActions.length,
    filteredCount: filteredActions.length,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedType,
    setSelectedType,
    activeTimelineAction,
    setActiveTimelineAction: setSelectedAction,
    logsModalAction,
    setLogsModalAction,
    isLoading,
    isError,
    error,
    refetch,
  };
}