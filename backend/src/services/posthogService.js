import "dotenv/config";

const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY || process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = (
  process.env.POSTHOG_HOST || "https://us.posthog.com"
).replace(/\/$/, "");

const EMPTY_RESULT = {
  available: false,
  source: "posthog",
  hasData: false,
  totalEvents: 0,
  distinctUsers: 0,
  activeDays: null,
  topEvents: [],
  companyUsage: [],
};

export async function getPostHogUsageSignals() {
  if (!API_KEY || !PROJECT_ID) {
    return {
      ...EMPTY_RESULT,
      reason: "PostHog credentials are not configured.",
    };
  }

  const query = {
    query: {
      kind: "HogQLQuery",
      query: `
        SELECT
          properties.company_id AS company_id,
          event,
          count() AS total,
          count(DISTINCT distinct_id) AS users,
          max(timestamp) AS last_seen
        FROM events
        WHERE
          timestamp >= now() - INTERVAL 30 DAY
          AND properties.company_id IS NOT NULL
        GROUP BY company_id, event
        ORDER BY total DESC
        LIMIT 100
      `,
    },
  };

  try {
    const response = await fetch(
      `${POSTHOG_HOST}/api/projects/${PROJECT_ID}/query/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(query),
        signal: AbortSignal.timeout(10000),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(
        result.detail ||
          result.error ||
          `PostHog query failed (${response.status})`
      );
    }

    const rows = result.results || [];

    const companyUsage = rows.map((row) => ({
      companyId: String(row[0]),
      event: String(row[1]),
      total: Number(row[2]) || 0,
      distinctUsers: Number(row[3]) || 0,
      lastSeen: row[4] || null,
    }));

    const topEvents = companyUsage.map((item) => ({
      event: item.event,
      total: item.total,
      distinctUsers: item.distinctUsers,
      lastSeen: item.lastSeen,
      companyId: item.companyId,
    }));

    const totalEvents = companyUsage.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const distinctUsers = Math.max(
      0,
      ...companyUsage.map((item) => item.distinctUsers)
    );

    return {
      available: true,
      source: "posthog",
      periodDays: 30,
      hasData: companyUsage.length > 0,
      totalEvents,
      distinctUsers,
      activeDays: null,
      topEvents,
      companyUsage,
      queriedAt: new Date().toISOString(),
      note:
        companyUsage.length === 0
          ? "No events with a company_id were found in the last 30 days."
          : "Usage is grouped by company_id and event name.",
    };
  } catch (error) {
    console.error("PostHog usage query failed:", error.message);

    return {
      ...EMPTY_RESULT,
      reason: error.message,
    };
  }
}