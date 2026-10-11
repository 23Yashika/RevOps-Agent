"use client";

import React from "react";
import { Search, Calendar, X } from "lucide-react";

interface ExecutionsFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  onReset: () => void;
}

export function ExecutionsFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  onReset,
}: ExecutionsFiltersProps) {
  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedType !== "ALL";

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Dropdown Filters & Date Badge */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dark-brown-brown-500/20 focus:bdark-brownr-dark-brown-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="EXECUTED">EXECUTED</option>
          <option value="APPROVED">APPROVED</option>
          <option value="PENDING">PENDING</option>
          <option value="REJECTED">REJECTED</option>
          <option value="FAILED">FAILED</option>
        </select>

        {/* Action Type Dropdown */}
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dark-brown-brown-500/20 focus:bdark-brownr-dark-brown-500"
        >
          <option value="ALL">All Actions</option>
          <option value="NOTIFY_OWNER">NOTIFY_OWNER</option>
          <option value="DRAFT_EMAIL">DRAFT_EMAIL</option>
          <option value="CREATE_TASK">CREATE_TASK</option>
          <option value="UPDATE_CRM">UPDATE_CRM</option>
        </select>

        {/* Date Range Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Oct 1, 2026 – Oct 11, 2026</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by account..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-dark-brown-brown-500/20 focus:bdark-brownr-dark-brown-500 transition-all"
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
    </div>
  );
}