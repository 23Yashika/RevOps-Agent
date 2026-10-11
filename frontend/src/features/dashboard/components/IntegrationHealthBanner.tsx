"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

interface IntegrationHealthBannerProps {
  hubspotConnected: boolean;
  gmailConnected: boolean;
  calendarConnected: boolean;
}

export function IntegrationHealthBanner({
  hubspotConnected,
  gmailConnected,
  calendarConnected,
}: IntegrationHealthBannerProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
          <span>Connected Revenue Systems</span>
        </h4>
        <p className="text-xs text-slate-300">
          Real-time synchronization across CRM, email conversations, and meeting schedules.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* HubSpot */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-200">HubSpot CRM:</span>
          <span className="text-emerald-400 font-medium">
            {hubspotConnected ? "Live" : "Disconnected"}
          </span>
        </div>

        {/* Gmail */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              gmailConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span className="font-semibold text-slate-200">Gmail:</span>
          <span
            className={
              gmailConnected ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"
            }
          >
            {gmailConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        {/* Calendar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              calendarConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span className="font-semibold text-slate-200">Calendar:</span>
          <span
            className={
              calendarConnected
                ? "text-emerald-400 font-medium"
                : "text-amber-400 font-medium"
            }
          >
            {calendarConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <Link
          href="/integrations"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <span>Manage</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}