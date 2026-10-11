"use client";

import React from "react";
import { X, Mail, Calendar, Building2, ShieldAlert, CheckCircle } from "lucide-react";

interface EvidenceModalProps {
  evidence: any | null;
  onClose: () => void;
}

export function EvidenceModal({ evidence, onClose }: EvidenceModalProps) {
  if (!evidence) return null;

  const isDemo = Boolean(evidence.demo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-dark-brown-50 text-dark-brown-600">
              {evidence.type === "email" ? (
                <Mail className="w-4 h-4" />
              ) : evidence.type === "calendar" ? (
                <Calendar className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {evidence.type === "email"
                ? "Email Activity Record"
                : evidence.type === "calendar"
                  ? "Calendar Meeting Record"
                  : "CRM Evidence Record"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Demo/Live Banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${isDemo
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
          >
            {isDemo ? (
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {isDemo ? "Synthetic Demo Data" : "Verified Live Activity"}
              </p>
              <p className="text-[11px] opacity-85 mt-0.5">
                {isDemo
                  ? "This record was generated for testing/hackathon demonstration and does not represent real customer correspondence."
                  : "Verified through authenticated Google Workspace APIs."}
              </p>
            </div>
          </div>

          {/* Record Details */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 font-mono">
            {evidence.title && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">
                  Title / Subject
                </span>
                <span className="text-slate-800 font-semibold text-xs">
                  {evidence.title}
                </span>
              </div>
            )}
            {evidence.date && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">
                  Timestamp
                </span>
                <span className="text-slate-700 text-xs">{evidence.date}</span>
              </div>
            )}
            {evidence.snippet && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">
                  Snippet / Content
                </span>
                <p className="text-slate-800 font-sans text-xs leading-relaxed mt-1 bg-white p-3 rounded-lg border border-slate-200">
                  {evidence.snippet}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}