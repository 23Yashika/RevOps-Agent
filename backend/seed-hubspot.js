
import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function main() {
  const session = await composio.create("revops-demo-user", {
    toolkits: ["hubspot"],
  });

  const result = await session.execute(
    "COMPOSIO_GET_TOOL_SCHEMAS",
    {
      tool_slugs: [
        "HUBSPOT_CREATE_OBJECT_ASSOCIATION",
        "HUBSPOT_LIST_ASSOCIATION_TYPES",
      ],
      session_id: "able",
    }
  );

  console.dir(result, {
    depth: 20,
    colors: true,
  });
}

main().catch((error) => {
  console.error("Schema retrieval failed:", error);
  process.exitCode = 1;
});
