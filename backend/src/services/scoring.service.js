
import { buildDealSignals } from "./signal.service.js";

/**
 * Calculate a transparent risk score using CRM signals and
 * company-specific product usage evidence.
 *
 * Missing PostHog data does not increase risk.
 */
export function scoreDeal(deal, productUsage = null) {
  const signals = buildDealSignals(deal, productUsage);

  // Preserve the existing CRM score as the baseline.
  let score = Math.max(
    0,
    Math.min(100, signals.crm.riskScore)
  );

  const reasons = [...signals.crm.evidence];

  const usage = signals.productUsage;

  if (!usage.available) {
    reasons.push(
      "PostHog is unavailable; no usage-based score adjustment was applied."
    );
  } else if (!usage.hasData) {
    reasons.push(
      usage.note ||
        "No PostHog events matched this company; no usage-based score adjustment was applied."
    );
  } else {
    reasons.push(
      `PostHog recorded ${usage.totalEvents} events for this company across the queried period.`
    );

    reasons.push(
      `PostHog usage is attributed to HubSpot company ID ${signals.companyId}.`
    );

    // Do not change the score based on raw event counts alone.
    // A future adjustment should use validated usage trends,
    // such as sustained activity decline or onboarding inactivity.
  }

  score = Math.round(
    Math.max(0, Math.min(100, score))
  );

  return {
    dealId: signals.dealId,
    companyId: signals.companyId,
    riskScore: score,
    riskLevel:
      score >= 50
        ? "high"
        : score >= 25
          ? "medium"
          : "low",
    signals,
    scoringReasons: reasons,
  };
}
