import prisma from "../config/database.js";

function toJsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_, item) =>
      typeof item === "bigint" ? item.toString() : item
    )
  );
}

function getAccountName(deal) {
  return deal.company || deal.dealName || "Unknown account";
}

function buildNotifyOwnerAction(deal) {
  const riskScore = Number(deal.riskScore) || 0;
  const riskLevel = String(deal.riskLevel || "").toLowerCase();

  // Preserve the existing rule: do not notify owners for low-risk deals.
  if (riskScore < 25 && riskLevel !== "high" && riskLevel !== "medium") {
    return null;
  }

  const recommendation =
    deal.aiInsights?.recommendation ||
    deal.aiInsights?.recommendedAction ||
    deal.aiInsights?.nextBestAction ||
    deal.recommendations?.[0] ||
    "Review the deal and confirm the next follow-up.";

  const accountName = getAccountName(deal);

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


function buildDraftEmailAction(deal) {
  const riskScore = Number(deal.riskScore) || 0;
  const riskLevel = String(deal.riskLevel || "").toLowerCase();
  const contact = deal.primaryContact;
  const email = String(contact?.email || "").trim();
  const aiDraft = deal.aiInsights?.followUpEmail;

  const isActionableRisk =
    riskScore >= 25 || riskLevel === "medium" || riskLevel === "high";

  if (!isActionableRisk || !contact || !email) {
    return null;
  }

  // Reject malformed and placeholder addresses.
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    /\.example$/i.test(email.split("@")[1] || "")
  ) {
    return null;
  }

  const accountName = getAccountName(deal);
  const dealName = deal.dealName || "Unnamed deal";

  const recommendation =
    deal.aiInsights?.nextBestAction ||
    deal.aiInsights?.recommendation ||
    deal.recommendations?.[0] ||
    "Review the proposal and agree on the next steps.";

  // Prefer the AI draft; use a factual fallback if AI is unavailable.
  const subject =
    String(aiDraft?.subject || "").trim() ||
    `Following up on ${dealName}`;

  const body =
    String(aiDraft?.body || "").trim() ||
    [
      `Hi ${contact.firstName || "there"},`,
      "",
      `I wanted to follow up regarding ${dealName} at ${accountName}.`,
      "",
      "We would appreciate an update on the proposal and any questions or concerns we can help address.",
      "",
      `Suggested next step: ${recommendation}`,
      "",
      "Please let us know a convenient time to discuss the next steps.",
      "",
      "Best regards,",
      "Customer Success Team",
    ].join("\n");

  const rationale =
    deal.aiInsights?.riskExplanation ||
    `A follow-up draft was prepared because this deal has a ${riskLevel || "qualifying"} risk level (score: ${riskScore}).`;

  return {
    accountName,
    type: "DRAFT_EMAIL",
    payload: {
      dealId: deal.dealId || deal.id || null,
      dealName,
      company: deal.company || accountName,
      contactId: contact.id || null,
      contactName:
        [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
        null,
      to: email,
      subject,
      body,
      riskScore,
      riskLevel: deal.riskLevel || "unknown",
      nextBestAction: recommendation,
      requiresHumanApproval: true,
      sent: false,
    },
    rationale,
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
      // Keep the existing owner notification and add a separate email draft.
      const actionsForDeal = [
        buildNotifyOwnerAction(deal),
        buildDraftEmailAction(deal),
      ].filter(Boolean);

      for (const actionData of actionsForDeal) {
        // Avoid duplicates of the same action type within this analysis run.
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
              type: actionData.type,
              riskScore: actionData.payload.riskScore,
              requiresHumanApproval: actionData.type === "DRAFT_EMAIL",
            },
          },
        });

        createdActions.push(action);
      }
    }

    return {
      analysisRun,
      proposedActions: createdActions,
    };
  }, {
    maxWait: 20000, // 20 seconds to allow Neon to wake up
    timeout: 30000, // 30 seconds for all writes to finish
  });
}
