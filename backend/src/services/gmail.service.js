
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

const USER_ID = process.env.COMPOSIO_USER_ID;
const GMAIL_ACCOUNT_ID = process.env.COMPOSIO_GMAIL_ACCOUNT_ID;

function ensureConfig() {
  if (!process.env.COMPOSIO_API_KEY || !USER_ID || !GMAIL_ACCOUNT_ID) {
    throw new Error(
      "Missing COMPOSIO_API_KEY, COMPOSIO_USER_ID, or COMPOSIO_GMAIL_ACCOUNT_ID."
    );
  }
}

export async function getGmailProfile() {
  ensureConfig();

  return composio.tools.execute("GMAIL_GET_PROFILE", {
    userId: USER_ID,
    connectedAccountId: GMAIL_ACCOUNT_ID,
    arguments: { user_id: "me" },
    version: "20261010_00",
  });
}

export async function fetchGmailThreads({
  maxResults = 10,
  query = "",
  verbose = true,
  pageToken,
} = {}) {
  ensureConfig();

  const safeMaxResults = Math.min(
    Math.max(Number.parseInt(maxResults, 10) || 10, 1),
    25
  );

  return composio.tools.execute("GMAIL_LIST_THREADS", {
    userId: USER_ID,
    connectedAccountId: GMAIL_ACCOUNT_ID,
    arguments: {
      user_id: "me",
      max_results: safeMaxResults,
      query,
      verbose,
      ...(pageToken ? { page_token: pageToken } : {}),
    },
    version: "20261010_00",
  });
}

export async function sendGmailEmail({ to, subject, body }) {
  ensureConfig();

  const recipient =
    process.env.CLIENT_EMAIL ||
    (process.env.GMAIL_ALLOWED_RECIPIENTS
      ? process.env.GMAIL_ALLOWED_RECIPIENTS.split(",")[0].trim()
      : null) ||
    to;

  const result = await composio.tools.execute("GMAIL_SEND_EMAIL", {
    userId: USER_ID,
    connectedAccountId: GMAIL_ACCOUNT_ID,
    arguments: {
      user_id: "me",
      recipient_email: recipient,
      subject,
      body,
    },
    version: "20261010_00",
  });

  if (!result.successful) {
    const errorMsg =
      result.error?.message ||
      (typeof result.error === "string"
        ? result.error
        : "Failed to send email via Composio Gmail.");
    throw new Error(errorMsg);
  }

  return {
    messageId: result.data?.id || result.data?.threadId || "sent-" + Date.now(),
    threadId: result.data?.threadId || null,
  };
}
