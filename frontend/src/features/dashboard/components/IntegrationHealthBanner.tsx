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
    <div className="bg-cardBg rounded-2xl p-5 text-textPrimary shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
       <h3 className="text-lg font-bold text-[#241B35] tracking-tight flex items-center gap-2">
  <span>Connected Revenue Systems</span>
</h3>

<p className="text-sm text-[#6B6478] mt-1">
  Real-time synchronization across CRM, email conversations, and meeting schedules.
</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* HubSpot */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cardBg border border-borderColor text-xs text-primaryDarkBrown">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-200">HubSpot CRM:</span>
          <span className="text-emerald-400 font-medium">
            {hubspotConnected ? "Live" : "Disconnected"}
          </span>
        </div>

        
{/* Gmail */}
<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cardBg border border-borderColor text-xs">
  <span className="w-2 h-2 rounded-full bg-emerald-400" />
  <span className="font-semibold text-[#241B35] text-textPrimary">Gmail:</span>
  <span className="text-emerald-400 font-medium">Connected</span>
</div>

{/* Calendar */}
<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cardBg border border-borderColor text-xs">
  <span className="w-2 h-2 rounded-full bg-emerald-400" />
  <span className="font-semibold text-[#241B35] text-textPrimary">Calendar:</span>
  <span className="text-emerald-400  font-medium">Connected</span>
</div>
      </div>
    </div>
  );
}