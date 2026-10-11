"use client";

import React from "react";
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Settings"
        subtitle="AI configuration, dry-run preferences, and system parameters."
      />
      <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center text-slate-500">
        Settings route stub (Module 8).
      </div>
    </div>
  );
}
