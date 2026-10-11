import React from "react";
import type { ActionStatus } from "@/types";

interface StatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = {
    PENDING: {
      bg: "bg-amber-100 text-amber-800 border-amber-300",
      label: "Pending Review",
    },
    APPROVED: {
      bg: "bg-blue-100 text-blue-800 border-blue-300",
      label: "Approved",
    },
    REJECTED: {
      bg: "bg-rose-100 text-rose-800 border-rose-300",
      label: "Rejected",
    },
    EXECUTING: {
      bg: "bg-indigo-100 text-indigo-800 border-indigo-300",
      label: "Executing...",
    },
    EXECUTED: {
      bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      label: "Executed",
    },
    FAILED: {
      bg: "bg-red-100 text-red-800 border-red-300",
      label: "Failed",
    },
  }[status] || {
    bg: "bg-gray-100 text-gray-800 border-gray-300",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${config.bg} ${className}`}
    >
      {config.label}
    </span>
  );
}
