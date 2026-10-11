import React from "react";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export function RiskBadge({ level, score, className = "" }: RiskBadgeProps) {
  const config = {
    high: {
      bg: "bg-rose-100 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      label: "High Risk",
    },
    medium: {
      bg: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "Medium Risk",
    },
    low: {
      bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "Low Risk",
    },
  }[level] || {
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-500",
    label: level,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {score !== undefined && score !== null && (
        <span className="font-mono text-[11px] opacity-85">({score})</span>
      )}
    </span>
  );
}
