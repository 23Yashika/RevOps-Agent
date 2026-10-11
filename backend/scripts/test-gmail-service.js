
import "dotenv/config";
import { getGmailProfile } from "../src/services/gmail.service.js";

try {
  const result = await getGmailProfile();

  console.log("Gmail service test:");
  console.log(JSON.stringify(result, null, 2));

  if (result.successful) {
    console.log("SUCCESS: Gmail service is working.");
  } else {
    console.log("Gmail returned an unsuccessful result.");
  }
} catch (error) {
  console.error("Gmail service test failed:", error.message);
}
