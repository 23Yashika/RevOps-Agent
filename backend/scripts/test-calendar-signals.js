
import "dotenv/config";
import "../src/services/calendar.service.js";
import { getCalendarSignals } from "../src/services/calendar.service.js";

async function main() {
  if (!process.env.COMPOSIO_API_KEY) {
    throw new Error(
      "COMPOSIO_API_KEY was not loaded. Check the backend .env file."
    );
  }

  console.log("Composio API key loaded.");
  console.log("Testing Calendar Signals...\n");

  const events = await getCalendarSignals({
    maxResults: 10,
  });

  console.log("Total events:", events.length);
  console.log(JSON.stringify(events, null, 2));
}

main().catch((error) => {
  console.error("Calendar signals test failed:", error.message);
  process.exitCode = 1;
});
