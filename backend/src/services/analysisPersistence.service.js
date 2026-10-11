
import prisma from "../config/database.js";
import { createProposedAction } from "./action.service.js";

function toJsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_, item) =>
      typeof item === "bigint" ? item.toString() : item
    )
  );
}

function buildActionFromDeal(deal) {
  const riskScore = Number(deal.riskScore) || 0;
  const riskLevel = String(deal.riskLevel || "").toLowerCase();

  // Do not create actions for low-risk deals automatically.
  if (riskScore < 25 && riskLevel !== "high" && riskLevel !== "medium") {
    return null;
  }

  const recommendation =
    deal.aiInsights?.recommendation ||
    deal.aiInsights?.recommendedAction ||
    deal.recommendations?.[0] ||
    "Review the deal and confirm the next follow-up.";

  const accountName =
    deal.company ||
    deal.dealName ||
    "Unknown account";

  return {
    accountName,
    type: "NOTIFY_OWNER",
    payload: {
      dealId: deal.dealId || deal.id || null,
      dealName: deal.dealName || "Unnamed deal",
      riskScore,
      riskLevel: deal.riskLevel || "unknown",
      recommendation,
      subject: `RevOps follow-up: ${deal.dealName || accountName}`,
    },
    rationale: `Risk score: ${riskScore}. ${recommendation}`,
    evidenceIds: toJsonSafe(deal.evidence || []),
  };
}

export async function persistAnalysis(analysis, actor = "revops-agent") {
  if (!analysis || !Array.isArray(analysis.deals)) {
    throw new Error("Analysis must contain a deals array.");
  }

  const safeAnalysis = toJsonSafe(analysis);

  return prisma.$transaction(async (tx) => {
    const analysisRun = await tx.analysisRun.create({
      data: {
        accountName: "RevOps Portfolio",
        evidence: safeAnalysis.deals.map((deal) => ({
          dealId: deal.dealId || deal.id || null,
          dealName: deal.dealName || "Unnamed deal",
          evidence: deal.evidence || [],
          riskScore: deal.riskScore ?? 0,
        })),
        modelOutput: safeAnalysis,
        promptVersion: "revops-analysis-v1",
        modelName: process.env.GROQ_MODEL || "unknown",
      },
    });

    const createdActions = [];

    for (const deal of safeAnalysis.deals) {
      const actionData = buildActionFromDeal(deal);

      if (!actionData) continue;

      // The action and its audit event are created by the existing service.
      // Do not create an action twice if it already exists for this run/deal.
      const existing = await tx.proposedAction.findFirst({
        where: {
          analysisRunId: analysisRun.id,
          accountName: actionData.accountName,
          type: actionData.type,
        },
      });

      if (existing) {
        createdActions.push(existing);
        continue;
      }

      const action = await tx.proposedAction.create({
        data: {
          ...actionData,
          analysisRunId: analysisRun.id,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "ACTION_CREATED",
          actor,
          proposedActionId: action.id,
          details: {
            source: "AI_ANALYSIS",
            analysisRunId: analysisRun.id,
            riskScore: actionData.payload.riskScore,
          },
        },
      });

      createdActions.push(action);
    }

    return {
      analysisRun,
      proposedActions: createdActions,
    };
  });
}
