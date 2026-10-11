import express from "express";
import { getRevOpsAnalysis } from "../services/analysisService.js";
import { generateDealInsights } from "../services/aiService.js";
import { persistAnalysis } from "../services/analysisPersistence.service.js";
const router = express.Router();

router.get("/", async (req, res) => {
console.log("AI-ENABLED ANALYSIS ROUTE HIT");

// Diagnostic header to verify which route handled this request.
res.setHeader("X-Analysis-Route", "ai-enabled");

try {
// Parse and validate the requested deal limit.
const parsedLimit = Number.parseInt(req.query.limit, 10);

const limit = Number.isNaN(parsedLimit)
  ? 10
  : Math.min(Math.max(parsedLimit, 1), 100);

// Step 1: Fetch CRM, email, calendar, and rules-based analysis.
const analysis = await getRevOpsAnalysis(limit);

if (!Array.isArray(analysis.deals)) {
  throw new Error(
    "getRevOpsAnalysis did not return a deals array."
  );
}

console.log(
  `Generating Groq insights for ${analysis.deals.length} deals...`
);

// Step 2: Generate AI insights independently for each deal.
const dealsWithInsights = await Promise.all(
  analysis.deals.map(async (deal) => {
    try {
      const aiInsights = await generateDealInsights(deal);

      console.log(
        `Groq analysis succeeded for deal ${deal.dealId}`
      );

      return {
        ...deal,
        aiInsights,
        aiStatus: "success",
        aiError: null,
      };
    } catch (error) {
      console.error(
        `AI analysis failed for deal ${deal.dealId}:`,
        error.status || "",
        error.message
      );

      // Preserve the original deal even if its AI request fails.
      return {
        ...deal,
        aiInsights: null,
        aiStatus: "failed",
        aiError: error.message || "Unknown AI error",
      };
    }
  })
);

// Step 3: Build the final response.
const successfulDeals = dealsWithInsights.filter(
  (deal) => deal.aiStatus === "success"
).length;

const failedDeals = dealsWithInsights.filter(
  (deal) => deal.aiStatus === "failed"
).length;

const response = {
  ...analysis,
  success: true,
  generatedAt: new Date().toISOString(),

  ai: {
    provider: "Groq",
    model:
      process.env.GROQ_MODEL ||
      "llama-3.3-70b-versatile",
    configured: Boolean(process.env.GROQ_API_KEY),
    successfulDeals,
    failedDeals,
  },

  deals: dealsWithInsights,
};

console.log("Analysis response prepared:", {
  deals: dealsWithInsights.length,
  successfulDeals,
  failedDeals,
  groqConfigured: Boolean(process.env.GROQ_API_KEY),
});

const persistence = await persistAnalysis(response);

return res.status(200).json({
  ...response,
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
});

} catch (error) {
console.error("RevOps analysis route failed:", error);

return res.status(500).json({
  success: false,
  message: "Failed to generate RevOps analysis.",
  error: error.message || "Unknown server error",
});

}
});

export default router;