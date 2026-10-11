
import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function main() {
  const result = await composio.tools.execute(
    "GOOGLECALENDAR_EVENTS_LIST",
    {
      userId: process.env.COMPOSIO_USER_ID,
      connectedAccountId:
        process.env.COMPOSIO_CALENDAR_ACCOUNT_ID,
      arguments: {
        calendarId: "primary",
        maxResults: 10,
        fields:
          "items(id,summary,start,end,status),nextPageToken",
      },
      version: "20261010_00",
    }
  );

  console.log(
    JSON.stringify(
      {
        successful: result.successful,
        error: result.error,
        data: result.data,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
