
/**
 * Normalize available RevOps evidence into a consistent structure.
 * Missing integrations are represented as unavailable, not as negative signals.
 *
 * Product usage is filtered by the associated HubSpot company ID.
 */

export function buildDealSignals(deal, productUsage = null) {
  const matchedEmails = deal.matchedEmails ?? [];
  const matchedEvents = deal.matchedEvents ?? [];

  const realEmails = matchedEmails.filter(
    (email) => !email.demo
  );

  const realEvents = matchedEvents.filter(
    (event) => !event.demo
  );

  // Get this deal's actual HubSpot company ID.
  const companyId = deal.companyId
    ? String(deal.companyId)
    : null;

  // Only include PostHog events attributed to this company.
  const allCompanyUsage = Array.isArray(productUsage?.companyUsage)
    ? productUsage.companyUsage
    : [];

  const matchingCompanyUsage = companyId
    ? allCompanyUsage.filter(
        (item) => String(item.companyId) === companyId
      )
    : [];

  const hasCompanyUsage = matchingCompanyUsage.length > 0;

  const companyTotalEvents = matchingCompanyUsage.reduce(
    (total, item) => total + (Number(item.total) || 0),
    0
  );

  const companyDistinctUsers = matchingCompanyUsage.reduce(
    (maximum, item) =>
      Math.max(maximum, Number(item.distinctUsers) || 0),
    0
  );

  const companyTopEvents = matchingCompanyUsage.map((item) => ({
    event: item.event,
    total: Number(item.total) || 0,
    distinctUsers: Number(item.distinctUsers) || 0,
    lastSeen: item.lastSeen ?? null,
    companyId: String(item.companyId),
  }));

  return {
    dealId: deal.dealId ?? null,
    dealName: deal.dealName ?? "Unnamed deal",
    company: deal.company ?? null,
    companyId,

    crm: {
      available: true,
      riskScore: Number(deal.riskScore) || 0,
      riskLevel: deal.riskLevel ?? "unknown",
      amount: Number(deal.amount) || 0,
      evidence: deal.evidence ?? [],
    },

    email: {
      available: deal.dataCoverage?.emailsAvailable === true,
      matchingCount: realEmails.length,
      demoCount: matchedEmails.length - realEmails.length,
    },

    calendar: {
      available: deal.dataCoverage?.calendarAvailable === true,
      matchingCount: realEvents.length,
      demoCount: matchedEvents.length - realEvents.length,
    },

    productUsage: {
      available: productUsage?.available === true,
      hasData: hasCompanyUsage,
      totalEvents: hasCompanyUsage ? companyTotalEvents : 0,
      distinctUsers: hasCompanyUsage ? companyDistinctUsers : 0,
      events: companyTopEvents,
      note: companyId
        ? hasCompanyUsage
          ? "Product usage matched by HubSpot company ID."
          : "No PostHog events matched this HubSpot company ID."
        : "Product usage could not be matched because the HubSpot company ID is missing.",
    },
  };
}
