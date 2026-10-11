
import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function main() {
  const session = await composio.create("revops-demo-user", {
    toolkits: ["hubspot"],
  });

  console.log("Fetching companies from HubSpot...");

  const result = await session.execute("HUBSPOT_SEARCH_COMPANIES", {
    limit: 5,
    properties: ["name", "domain", "website"],
  });

  console.log("\nHubSpot company data:");
  console.dir(result, { depth: 8, colors: true });
}

main().catch((error) => {
  console.error("HubSpot data fetch failed:", error.message);
  process.exitCode = 1;
});
