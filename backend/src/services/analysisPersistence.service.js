
import prisma from "../config/database.js";

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

  // Propose actions only for medium/high-risk deals.
  if (
    riskScore < 25 &&
    riskLevel !== "high" &&
    riskLevel !== "medium"
  ) {
    return null;
  }

  const recommendation =
    deal.aiInsights?.nextBestAction ||
    deal.aiInsights?.recommendation ||
    deal.aiInsights?.recommendedAction ||
    deal.recommendations?.[0] ||
    "Review the deal and confirm the next follow-up.";

  const accountName =
    deal.company || deal.dealName || "Unknown account";

  return {
    accountName,
    type: "NOTIFY_OWNER",
    payload: {
      dealId: deal.dealId || deal.id || null,
      dealName: deal.dealName || "Unnamed deal",
      riskScore,
      riskLevel: deal.riskLevel || "unknown",
      recommendation,
      subject: `RevOps follow-up: ${
        deal.dealName || accountName
      }`,
    },
    rationale: `Risk score: ${riskScore}. ${recommendation}`,
    evidenceIds: toJsonSafe(deal.evidence || []),
  };
}

function getDealId(action) {
  return action?.payload?.dealId == null
    ? null
    : String(action.payload.dealId);
}

async function findExistingPendingAction(tx, actionData) {
  const dealId = getDealId(actionData);

  // Filter in the database rather than fetching every pending
  // action for the account and filtering them in JavaScript.
  const candidates = await tx.proposedAction.findMany({
    where: {
      accountName: actionData.accountName,
      type: actionData.type,
      status: "PENDING",
    },
    select: {
      id: true,
      accountName: true,
      type: true,
      status: true,
      payload: true,
      createdAt: true,
      analysisRunId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const existingAction = candidates.find(
    (candidate) => getDealId(candidate) === dealId
  );

  return existingAction || null;
}

export async function persistAnalysis(
  analysis,
  actor = "revops-agent"
) {
  if (!analysis || !Array.isArray(analysis.deals)) {
    throw new Error("Analysis must contain a deals array.");
  }

  const safeAnalysis = toJsonSafe(analysis);

  // Prepare the action data before opening the transaction.
  // This keeps non-database processing outside the transaction.
  const actionsToConsider = safeAnalysis.deals
    .map((deal) => buildActionFromDeal(deal))
    .filter(Boolean);

  return prisma.$transaction(
    async (tx) => {
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

      const proposedActions = [];

      for (const actionData of actionsToConsider) {
        const existingAction = await findExistingPendingAction(
          tx,
          actionData
        );

        if (existingAction) {
          // Keep the existing pending action; do not create a duplicate.
          proposedActions.push(existingAction);
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

        proposedActions.push(action);
      }

      return {
        analysisRun,
        proposedActions,
      };
    },
    {
      // Allow extra time for Neon database latency.
      maxWait: 10000,
      timeout: 20000,
    }
  );
}
