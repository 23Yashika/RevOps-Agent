
import "dotenv/config";
import { getPostHogUsageSignals } from "./src/services/posthogService.js";

const result = await getPostHogUsageSignals();

console.log("PostHog usage signal test:");
console.log(JSON.stringify(result, null, 2));
