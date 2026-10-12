import "dotenv/config";
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

async function main() {
  try {
    const session = await composio.create("revops-demo-user", {
      toolkits: ["hubspot"],
    });
    // In Composio core, let's see what tools are available or session properties
    console.log("Session tools:", Object.keys(session));
    if (session.actions) {
      console.log("Actions:", session.actions.map(a => a.name).slice(0, 30));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
