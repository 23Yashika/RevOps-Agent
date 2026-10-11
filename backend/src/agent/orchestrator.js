
import { getRevOpsAnalysis } from "../services/analysisService.js";
import { generateDealInsights } from "../services/aiService.js";
import { getPostHogUsageSignals } from "../services/posthogService.js";
import { getCalendarSignals } from "../services/calendar.service.js";
import { scoreDeal } from "../services/scoring.service.js";
import { persistAnalysis } from "../services/analysisPersistence.service.js";

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

  // Step 1: Retrieve HubSpot CRM analysis.
  const analysis = await getRevOpsAnalysis(safeLimit);

  if (!Array.isArray(analysis.deals)) {
    throw new Error(
      "RevOps analysis did not return a deals array."
    );
  }

  // Step 2: Retrieve PostHog usage signals.
  const productUsage = await getPostHogUsageSignals();

  // Step 3: Retrieve Google Calendar events.
  // Calendar failure should not stop the CRM analysis.
  let calendarEvents = [];
  let calendarAvailable = false;
  let calendarError = null;

  try {
    calendarEvents = await getCalendarSignals({
      maxResults: 100,
    });

    calendarAvailable = true;

    console.log("Google Calendar signals retrieved.", {
      eventCount: calendarEvents.length,
    });
  } catch (error) {
    calendarError =
      error.message || "Unknown Google Calendar error";

    console.error(
      "Google Calendar signals could not be retrieved:",
      calendarError
    );
  }

  // Step 4: Score each deal using its company's PostHog usage.
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

  // Step 5: Assemble the unified analysis result.
  // Calendar events are exposed separately until reliable
  // deal-to-event matching is implemented.
  const successfulDeals = deals.filter(
    (deal) => deal.aiStatus === "success"
  ).length;

  const failedDeals = deals.length - successfulDeals;

  const result = {
    ...analysis,
    generatedAt: new Date().toISOString(),

    productUsage,

    calendar: {
      available: calendarAvailable,
      eventCount: calendarEvents.length,
      events: calendarEvents,
      error: calendarError,
    },

    integrations: {
      ...analysis.integrations,
      posthog: Boolean(productUsage.available),
      calendar: calendarAvailable,
    },

    dataSources: {
      ...analysis.dataSources,

      posthog: !productUsage.available
        ? "unavailable"
        : productUsage.hasData
          ? "live"
          : "connected, no events",

      calendar: !calendarAvailable
        ? "unavailable"
        : calendarEvents.length
          ? "live"
          : "connected, no events",
    },

    ai: {
      provider: "Groq",
      model:
        process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      configured: Boolean(process.env.GROQ_API_KEY),
      successfulDeals,
      failedDeals,
    },

    deals,
  };

  // Step 6: Persist analysis and proposed actions.
  // No email or calendar action is executed here.
  const persistence = await persistAnalysis(result);

  console.log("RevOps agent completed.", {
    dealsAnalyzed: deals.length,
    successfulDeals,
    failedDeals,
    calendarEvents: calendarEvents.length,
    calendarAvailable,
    proposedActions: persistence.proposedActions.length,
  });

  return {
    ...result,

    persistence: {
      analysisRunId: persistence.analysisRun.id,
      proposedActionsCreated:
        persistence.proposedActions.length,

      proposedActions: persistence.proposedActions.map(
        (action) => ({
          id: action.id,
          accountName: action.accountName,
          type: action.type,
          status: action.status,
        })
      ),
    },
  };
}
