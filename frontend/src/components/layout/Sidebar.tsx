"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BrainCircuit,
  CheckSquare,
  History,
  LineChart,
  Plug,
  Settings,
  ShieldCheck,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deals & Accounts", href: "/deals", icon: Building2 },
  { name: "AI Intelligence", href: "/intelligence/deal-1", icon: BrainCircuit },
  { name: "Approval Center", href: "/approvals", icon: CheckSquare },
  { name: "Execution History", href: "/executions", icon: History },
  { name: "PostHog Analytics", href: "/posthog", icon: LineChart },
  // { name: "Integrations", href: "/integrations", icon: Plug },
  // { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (c: boolean) => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/intelligence/")) {
      return pathname.startsWith("/intelligence");
    }
    return pathname === href;
  };

  const navContent = (
    <div className={`flex flex-col h-screen bg-sidebarBg text-textPrimary ${collapsed ? "w-[76px]" : "w-64"} border-r border-borderColor transition-width duration-200 ease-in-out fixed top-0 left-0 z-20`}>
      <div className={`flex items-center ${collapsed ? "px-3" : "px-6"} py-5 border-b border-slate-800 ${collapsed ? "justify-center" : "justify-between"}`}>
{!collapsed && (
  <Link href="/dashboard" className="flex items-center gap-3 group">
    <div className="w-9 h-9 rounded-xl bg-primaryDarkBrown flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
      <BrainCircuit className="w-5 h-5" />
    </div>
    <div>
      <h1 className="font-bold text-textPrimary tracking-tight text-lg leading-tight">RevOps Agent</h1>
      <p className="text-[10px] text-primaryDarkBrown font-semibold tracking-wider uppercase">Revenue Intelligence</p>
    </div>
  </Link>
)}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl bg-primaryDarkBrown text-white hover:bg-primaryDarkBrown/80 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              onClick={() => setMobileOpen(false)}
              className={`flex items\-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primaryAction text-cardBg shadow-md font-semibold"
                  : "text-primaryDarkBrown hover:bg-activeNavBg hover:text-primaryDarkBrown"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-cardBg" : "text-primaryDarkBrown"}`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 bg-[#D8C9B5]">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-cardBg border border-borderColor">
          <div className="w-8 h-8 rounded-lg bg-primaryDarkBrown/20 border border-primaryDarkBrown/30 flex items-center justify-center text-cardBg font-semibold text-xs">
            PM
          </div>
          <div className="flex-1 min-w-0">
          {!collapsed && (
            <p className="text-xs font-semibold text-primaryDarkBrown truncate">
              Parthika Mahajan
            </p>
          )}
          { !collapsed && (
            <div className="flex items-center gap-1 text-[10px] text-secondary">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Reviewer</span>
            </div>
          ) }
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="block">
        {navContent}
      </aside>



      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-y-0 left-0 z-50" onClick={(e) => e.stopPropagation()}>
            {/* Close button inside drawer */}
            <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-white absolute top-2 right-2">
              <X className="w-5 h-5" />
            </button>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
