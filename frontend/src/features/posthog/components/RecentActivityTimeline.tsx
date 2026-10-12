import React from "react";
import { Clock } from "lucide-react";

/**
 * Simple vertical timeline for recent activity.
 */
export function RecentActivityTimeline({ steps }: { steps: { label: string; icon?: React.ReactNode }[] }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Activity</h3>
      <ul className="space-y-4">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {step.icon ?? <Clock className="w-4 h-4 text-slate-500" />}
            </div>
            <span className="text-sm text-slate-700">{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
