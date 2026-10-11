import { getRevOpsAnalysis } from "../services/analysisService.js";
import { generateDealInsights } from "../services/aiService.js";
import { getPostHogUsageSignals } from "../services/posthogService.js";
import { scoreDeal } from "../services/scoring.service.js";
import { persistAnalysis } from "../services/analysisPersistence.service.js";

/**
 * Run the RevOps analysis pipeline.
 *
 * 1. Collect CRM, email and calendar evidence.
 * 2. Retrieve PostHog usage signals.
 * 3. Match usage to each deal's associated HubSpot company.
 * 4. Calculate risk scores.
 * 5. Generate AI insights.
 * 6. Persist analysis and proposed actions.
 *
 * External actions are not executed here.
 */

function getCompanySpecificUsage(productUsage, companyId) {
  if (!productUsage?.available || !companyId) {
    return {
      ...productUsage,
      hasData: false,
      totalEvents: 0,
      distinctUsers: 0,
      topEvents: [],
      companyUsage: [],
      note: !companyId
        ? "Usage could not be matched because the HubSpot company ID is missing."
        : "PostHog is unavailable.",
    };
  }

  const companyUsage = (
    Array.isArray(productUsage.companyUsage)
      ? productUsage.companyUsage
      : []
  ).filter(
    (item) => String(item.companyId) === String(companyId)
  );

  const totalEvents = companyUsage.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  const distinctUsers = companyUsage.reduce(
    (max, item) =>
      Math.max(max, Number(item.distinctUsers) || 0),
    0
  );

  return {
    ...productUsage,
    hasData: companyUsage.length > 0,
    totalEvents,
    distinctUsers,
    topEvents: companyUsage.map((item) => ({
      event: item.event,
      total: Number(item.total) || 0,
      distinctUsers: Number(item.distinctUsers) || 0,
      lastSeen: item.lastSeen ?? null,
      companyId: String(item.companyId),
    })),
    companyUsage,
    note: companyUsage.length
      ? "Usage matched by HubSpot company ID."
      : "No PostHog events matched this HubSpot company ID.",
  };
}

export async function runRevOpsAgent({ limit = 10 } = {}) {
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isNaN(parsedLimit)
    ? 10
    : Math.min(Math.max(parsedLimit, 1), 100);

  console.log("RevOps agent started.");

  // Step 1: Retrieve CRM, email and calendar analysis.
  const analysis = await getRevOpsAnalysis(safeLimit);

  if (!Array.isArray(analysis.deals)) {
    throw new Error("RevOps analysis did not return a deals array.");
  }

  // Step 2: Retrieve project-wide PostHog usage.
  const productUsage = await getPostHogUsageSignals();

  // Step 3: Score each deal using only its company's usage.
  const deals = await Promise.all(
    analysis.deals.map(async (deal) => {
      const companyId = deal.companyId
        ? String(deal.companyId)
        : null;

      const companyUsage = getCompanySpecificUsage(
        productUsage,
        companyId
      );

      const scoring = scoreDeal(
        {
          ...deal,
          companyId,
        },
        companyUsage
      );

      let aiInsights = null;
      let aiStatus = "failed";
      let aiError = null;

      try {
        aiInsights = await generateDealInsights({
          ...deal,
          companyId,
          riskScore: scoring.riskScore,
          riskLevel: scoring.riskLevel,
          signals: scoring.signals,
          scoringReasons: scoring.scoringReasons,
        });

        aiStatus = "success";
      } catch (error) {
        aiError = error.message || "Unknown AI error";

        console.error(
          `AI insights failed for ${deal.dealName}:`,
          aiError
        );
      }

      return {
        ...deal,
        ...scoring,
        companyId,
        aiInsights,
        aiStatus,
        aiError,
      };
    })
  );

  // Step 4: Assemble the unified analysis result.
  const successfulDeals = deals.filter(
    (deal) => deal.aiStatus === "success"
  ).length;

  const failedDeals = deals.length - successfulDeals;

  const result = {
    ...analysis,
    generatedAt: new Date().toISOString(),
    productUsage,

    integrations: {
      ...analysis.integrations,
      posthog: productUsage.available,
    },

    dataSources: {
      ...analysis.dataSources,
      posthog: !productUsage.available
        ? "unavailable"
        : productUsage.hasData
          ? "live"
          : "connected, no events",
    },

    ai: {
      provider: "Groq",
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      configured: Boolean(process.env.GROQ_API_KEY),
      successfulDeals,
      failedDeals,
    },

    deals,
  };

  // Step 5: Persist analysis and proposed actions.
  const persistence = await persistAnalysis(result);

  console.log("RevOps agent completed.", {
    dealsAnalyzed: deals.length,
    successfulDeals,
    failedDeals,
    proposedActions: persistence.proposedActions.length,
  });

  return {
    ...result,
    persistence: {
      analysisRunId: persistence.analysisRun.id,
      proposedActionsCreated: persistence.proposedActions.length,
      proposedActions: persistence.proposedActions.map((action) => ({
        id: action.id,
        accountName: action.accountName,
        type: action.type,
        status: action.status,
      })),
    },
  };
}
