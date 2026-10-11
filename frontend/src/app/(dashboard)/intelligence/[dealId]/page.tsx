"use client";

import React from "react";
import { Header } from "@/components/layout/Header";

export default function IntelligencePage({ params }: { params: { dealId: string } }) {
  return (
    <div className="space-y-6">
      <Header
        title="AI Intelligence — Deal Detail"
        subtitle={`Deep dive into deal analysis, evidence, and recommendations (${params.dealId}).`}
      />
      <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center text-slate-500">
        AI Intelligence detail route stub (Module 3).
      </div>
    </div>
  );
}
