
import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function main() {
  const tool = await composio.tools.getRawComposioToolBySlug(
    "GOOGLECALENDAR_EVENTS_LIST"
  );

  console.log(
    JSON.stringify(
      {
        slug: tool.slug,
        version: tool.version,
        inputParameters: tool.inputParameters,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exitCode = 1;
});
