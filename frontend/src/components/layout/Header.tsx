"use client";

import React from "react";
import { Clock, Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  lastAnalysisAt?: string;
}

export function Header({ title, subtitle, action, lastAnalysisAt }: HeaderProps) {
  return (
    <header className="bg-sidebarDarkBg border-2 border-[#5929C4] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-black tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-black mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {lastAnalysisAt && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last analyzed: {lastAnalysisAt}</span>
          </div>
        )}

        {action ? (
          action
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primaryAction/20 text-primaryDarkBrown border border-primaryAction/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primaryDarkBrown" />
            <span>AI Powered</span>
          </div>
        )}
      </div>
    </header>
  );
}
