
import "dotenv/config";
import { randomUUID } from "node:crypto";

const projectId = process.env.POSTHOG_PROJECT_ID;
const apiKey = process.env.POSTHOG_API_KEY;
const host = (
  process.env.POSTHOG_HOST || "https://us.posthog.com"
).replace(/\/$/, "");

if (!projectId || !apiKey) {
  console.error("Missing PostHog project ID or API key in .env");
  process.exit(1);
}

const eventName = "revops_backend_test";

const response = await fetch(`${host}/capture/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    api_key: apiKey,
    event: eventName,
    distinct_id: `revops-test-${randomUUID()}`,
  properties: {
  source: "revops-agent-backend",
  environment: "test",
 company_id: "351660134087",
},
  }),
});

const body = await response.text();

console.log("HTTP status:", response.status);
console.log("PostHog response:", body);

if (!response.ok) {
  process.exitCode = 1;
}
