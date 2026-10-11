"use client";

import React from "react";
import { Header } from "@/components/layout/Header";

export default function PostHogPage() {
  return (
    <div className="space-y-6">
      <Header
        title="PostHog Analytics"
        subtitle="Product usage insights and behavioral engagement signals."
      />
      <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center text-slate-500">
        PostHog Analytics route stub (Module 6).
      </div>
    </div>
  );
}
