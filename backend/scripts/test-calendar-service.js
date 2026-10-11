
import "dotenv/config";
import { fetchCalendarEvents } from "../src/services/calendar.service.js";

async function main() {
  console.log("Fetching Google Calendar events...");

  const result = await fetchCalendarEvents({
    maxResults: 5,
  });

  console.log(
    JSON.stringify(
      {
        successful: result.successful,
        error: result.error,
        events: (result.data?.items || []).map((event) => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end,
          status: event.status,
          attendees: event.attendees?.length || 0,
        })),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Calendar events test failed:", error.message);
  process.exitCode = 1;
});
