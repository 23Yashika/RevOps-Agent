"use client";

import React from "react";
import { Mail, Calendar, Building2, Eye, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import type { DealAnalysis } from "@/types";

interface EvidenceTabProps {
  deal: DealAnalysis;
  onViewEvidence: (evidence: any) => void;
}

export function EvidenceTab({ deal, onViewEvidence }: EvidenceTabProps) {
  return (
    <div className="space-y-4">
      {/* Informational Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Evidence Vault</h3>
          <p className="text-xs text-slate-500">
            Source signals tracked across CRM, emails, and meetings. Synthetic records are flagged.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. CRM Deal Stage Evidence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900">CRM Deal Stage</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live CRM
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Stage <span className="font-semibold text-slate-800">"{deal.stage}"</span> — evaluated for deal progression velocity.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onViewEvidence({
                type: "crm",
                title: `CRM Stage: ${deal.stage}`,
                snippet: `Deal amount: $${deal.amount}. Associated with company: ${deal.company || "N/A"}. Evaluated by RevOps rule engine.`,
                demo: false,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
        </div>

        {/* 2. Email Activity Evidence */}
        {deal.matchedEmails?.length > 0 ? (
          deal.matchedEmails.map((email, idx) => (
            <div
              key={`email-${idx}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">Email Activity</p>
                    {email.demo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Demo Data</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live Gmail
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 font-semibold mt-1">
                    {email.subject || "Customer Correspondence"}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {email.snippet || "No snippet available"}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onViewEvidence({
                    type: "email",
                    title: email.subject,
                    date: email.date,
                    snippet: email.snippet,
                    demo: email.demo,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center">
            No matching emails found for this account.
          </div>
        )}

        {/* 3. Calendar Activity Evidence */}
        {deal.matchedEvents?.length > 0 ? (
          deal.matchedEvents.map((evt, idx) => (
            <div
              key={`event-${idx}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">Calendar Activity</p>
                    {evt.demo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Demo Data</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live Calendar
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 font-semibold mt-1">
                    {evt.summary || "Scheduled Meeting"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {evt.start ? new Date(evt.start).toLocaleString() : "Date not scheduled"}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onViewEvidence({
                    type: "calendar",
                    title: evt.summary,
                    date: evt.start,
                    snippet: evt.description || "Meeting with stakeholders.",
                    demo: evt.demo,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center">
            No matching calendar events found for this account.
          </div>
        )}
      </div>
    </div>
  );
}