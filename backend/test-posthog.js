
import "dotenv/config";

const apiKey = process.env.POSTHOG_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID;
const host = process.env.POSTHOG_HOST || "https://us.posthog.com";

if (!apiKey || !projectId) {
  console.error(
    "Missing POSTHOG_API_KEY or POSTHOG_PROJECT_ID in .env"
  );
  process.exit(1);
}

async function testPostHog() {
  try {
    const response = await fetch(
      `${host}/api/projects/${projectId}/`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PostHog request failed:", response.status);
      console.error(await response.text());
      return;
    }

    const project = await response.json();

    console.log("PostHog connection successful!");
    console.log("Project:", project.name);
    console.log("Project ID:", project.id);
  } catch (error) {
    console.error("Connection error:", error.message);
  }
}

testPostHog();
