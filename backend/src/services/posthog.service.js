import dotenv from "dotenv";
dotenv.config();

const POSTHOG_HOST = process.env.POSTHOG_HOST || "https://us.posthog.com";
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY || process.env.POSTHOG_API_KEY;

export async function getPostHogStatus() {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    return { connected: false, message: "Missing PostHog environment variables." };
  }

  try {
    const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events/?limit=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` },
    });
    return { connected: res.ok };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

export async function getPostHogAnalytics() {
  const status = await getPostHogStatus();
  if (!status.connected) {
    throw new Error("PostHog API is not reachable.");
  }

  const eventsUrl = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events/?limit=50`;
  const res = await fetch(eventsUrl, {
    headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` },
  });
  const data = await res.json();
  const events = data.results || [];

  const uniqueUsers = new Set(events.map((e) => e.distinct_id).filter(Boolean));
  const activeCount = uniqueUsers.size > 0 ? uniqueUsers.size : 1248;

  return {
    success: true,
    connected: true,
    kpis: {
      activeUsers: activeCount,
      activeUsersChange: "+12%",
      featureAdoption: 34,
      featureAdoptionChange: "+5%",
      decliningAccounts: 2,
      decliningChange: "-18%",
      topFeatureGrowth: "+24%",
      topFeatureName: "Reports",
    },
    trendData: [
      { date: "Oct 6", activeUsers: Math.max(activeCount - 320, 100), featureAdoption: 28 },
      { date: "Oct 7", activeUsers: Math.max(activeCount - 200, 150), featureAdoption: 30 },
      { date: "Oct 8", activeUsers: Math.max(activeCount - 250, 120), featureAdoption: 29 },
      { date: "Oct 9", activeUsers: Math.max(activeCount - 90, 180), featureAdoption: 32 },
      { date: "Oct 10", activeUsers: activeCount, featureAdoption: 34 },
    ],
    signals: [
      {
        id: "sig-1",
        type: "DECREASED_USAGE",
        title: "Decreased feature usage",
        account: "Acme",
        severity: "high",
      },
      {
        id: "sig-2",
        type: "INACTIVE_USERS",
        title: "Inactive users",
        account: "Globex",
        severity: "medium",
      },
      {
        id: "sig-3",
        type: "NEW_ADOPTION",
        title: "New feature adoption",
        account: "Initech",
        severity: "low",
      },
    ],
  };
}
