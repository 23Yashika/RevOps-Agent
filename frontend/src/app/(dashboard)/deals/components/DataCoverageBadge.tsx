"use client";

import React from "react";
import { CheckCircle2, XCircle, Mail, Calendar, Building2 } from "lucide-react";
import type { DataCoverage } from "@/types";

interface DataCoverageBadgeProps {
  coverage?: DataCoverage;
}

export function DataCoverageBadge({ coverage }: DataCoverageBadgeProps) {
  if (!coverage) {
    return (
      <span className="text-xs text-slate-400 font-mono">--/--</span>
    );
  }

  const signals = [
    {
      name: "CRM",
      icon: Building2,
      active: coverage.companyMatched,
      detail: `${coverage.associatedContacts} contacts`,
    },
    {
      name: "Email",
      icon: Mail,
      active: coverage.matchingEmails > 0,
      detail: `${coverage.matchingEmails} emails`,
    },
    {
      name: "Calendar",
      icon: Calendar,
      active: coverage.matchingEvents > 0,
      detail: `${coverage.matchingEvents} events`,
    },
  ];

  const activeCount = signals.filter((s) => s.active).length;

  return (
    <div className="flex items-center gap-1.5" title={`${activeCount}/3 signals matched`}>
      <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
        {activeCount}/3
      </span>
      <div className="flex items-center gap-1">
        {signals.map((sig) => {
          const Icon = sig.icon;
          return (
            <div
              key={sig.name}
              className={`p-1 rounded-md flex items-center justify-center ${
                sig.active
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-400 opacity-60"
              }`}
              title={`${sig.name}: ${sig.active ? sig.detail : "No matched activity"}`}
            >
              <Icon className="w-3 h-3" />
            </div>
          );
        })}
      </div>
    </div>
  );
}