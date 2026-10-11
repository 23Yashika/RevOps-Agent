
import "dotenv/config";

const projectId = process.env.POSTHOG_PROJECT_ID;
const host = process.env.POSTHOG_HOST || "https://us.posthog.com";
const apiKey = process.env.POSTHOG_API_KEY;

async function testEvents() {
  try {
    const response = await fetch(
      `${host}/api/projects/${projectId}/query/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: `
              SELECT event, count() AS total
              FROM events
              GROUP BY event
              ORDER BY total DESC
              LIMIT 10
            `,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Analytics query failed:", response.status);
      console.error(JSON.stringify(result, null, 2));
      return;
    }

    console.log("PostHog analytics query successful!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

testEvents();
