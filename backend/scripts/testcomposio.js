
import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

try {
  const tool = await composio.tools.getRawComposioToolBySlug(
    "GMAIL_LIST_THREADS"
  );

  console.log("Gmail thread tool metadata:");
  console.log(JSON.stringify(tool, null, 2));
} catch (error) {
  console.error("Failed to inspect Gmail tool:", error.message);
}
