
import "dotenv/config";
import { fetchGmailThreads } from "../src/services/gmail.service.js";

try {
  const result = await fetchGmailThreads({
    maxResults: 5,
    query: "newer_than:90d",
    verbose: true,
  });

  console.log("Successful:", result.successful);
  console.log("Error:", result.error ?? null);

  if (!result.successful) {
    process.exitCode = 1;
  } else {
    const data = result.data ?? {};
    const threads = data.threads ?? [];

    console.log("Threads returned:", threads.length);
    console.log(
      JSON.stringify(
        {
          threads: threads.map((thread) => ({
            id: thread.id,
            snippet: thread.snippet,
            messageCount: thread.messages?.length,
          })),
          nextPageToken: data.nextPageToken ?? null,
        },
        null,
        2
      )
    );
  }
} catch (error) {
  console.error("Gmail thread test failed:", error.message);
  process.exitCode = 1;
}
