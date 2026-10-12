/* src/app/acme/page.tsx */
"use client";

import React from "react";
import { Header } from "@/components/layout/Header";

export default function AcmeDemoPage() {
  const headerTitle = "RevOps Demo - Acme";
  const headerSubtitle = "Experience the premium RevOps dashboard experience, tailored for Acme.";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header title={headerTitle} subtitle={headerSubtitle} />
      {/* Placeholder content */}
      <section className="p-6 bg-cardBg rounded-2xl shadow-xs">
        <h2 className="text-lg font-semibold text-primaryDarkBrown mb-2">
          Welcome to the Acme Demo
        </h2>
        <p className="text-sm text-textSecondary">
          This page showcases the same premium beige theme and UI components used across the RevOps
          platform. Feel free to explore the dashboard components, KPIs, and integration health banner
          with the styling consistent throughout the application.
        </p>
      </section>
    </div>
  );
}
