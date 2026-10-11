"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Plug, Sparkles } from "lucide-react";

interface PostHogDisconnectedBannerProps {
  previewMode: boolean;
  onTogglePreview: () => void;
}

export function PostHogDisconnectedBanner({
  previewMode,
  onTogglePreview,
}: PostHogDisconnectedBannerProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <Plug className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-amber-950">
              PostHog MCP Telemetry Disconnected
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
              MCP Integration Required
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
            Your Express backend does not currently have active PostHog API credentials or an MCP server connected. 
            Connect PostHog via Composio to ingest live product telemetry, DAU/MAU ratios, and feature adoption drop-offs into deal risk scoring.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onTogglePreview}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100/50 transition-colors shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{previewMode ? "Hide Telemetry Preview" : "Show Telemetry Preview"}</span>
        </button>

        <Link
          href="/integrations"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <span>Connect PostHog</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}