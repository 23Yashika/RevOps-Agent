"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";

interface DealsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRisk: string;
  onRiskChange: (value: string) => void;
  selectedStage: string;
  onStageChange: (value: string) => void;
  selectedCoverage: string;
  onCoverageChange: (value: string) => void;
  stages: string[];
  onReset: () => void;
}

export function DealsFilters({
  searchQuery,
  onSearchChange,
  selectedRisk,
  onRiskChange,
  selectedStage,
  onStageChange,
  selectedCoverage,
  onCoverageChange,
  stages,
  onReset,
}: DealsFiltersProps) {
  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedRisk !== "ALL" ||
    selectedStage !== "ALL" ||
    selectedCoverage !== "ALL";

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search accounts, deals, or companies..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dark-brown-500/20 focus:border-dark-brown-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={selectedRisk}
          onChange={(e) => onRiskChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dark-brown-500/20 focus:border-dark-brown-500"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>

        <select
          value={selectedStage}
          onChange={(e) => onStageChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dark-brown-500/20 focus:border-dark-brown-500"
        >
          <option value="ALL">All Stages</option>
          {stages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>

        <select
          value={selectedCoverage}
          onChange={(e) => onCoverageChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dark-brown-500/20 focus:border-dark-brown-500"
        >
          <option value="ALL">All Coverage</option>
          <option value="FULL">Full Coverage (3/3)</option>
          <option value="PARTIAL">Partial (1-2 signals)</option>
          <option value="LOW">Low Coverage (CRM only)</option>
        </select>

        {isFiltered && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
