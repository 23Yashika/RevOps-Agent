import React from "react";

export function LoadingSkeleton({ className = "h-6 w-full" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-5 w-1/3" />
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
      <LoadingSkeleton className="h-8 w-1/2" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  );
}
