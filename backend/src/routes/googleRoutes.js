
import { Router } from "express";
import { google } from "googleapis";
import { randomBytes } from "node:crypto";

const router = Router();

const requiredEnv = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
];

function getMissingEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function createOAuthClient() {
  if (getMissingEnv().length) {
    throw new Error(
      `Missing Google environment variables: ${getMissingEnv().join(", ")}`
    );
  }

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Temporary storage for a single-user local hackathon demo.
// Tokens and OAuth states are lost when the server restarts.
const oauthClient = createOAuthClient();
let savedTokens = null;

function getGrantedScopes() {
  return savedTokens?.scope
    ? savedTokens.scope.split(/\s+/)
    : [];
}

const pendingStates = new Map();

const scopes = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.readonly",
];

router.get("/auth", (req, res) => {
  try {
    const state = randomBytes(32).toString("hex");
    pendingStates.set(state, Date.now() + 10 * 60 * 1000);

    const authUrl = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
      state,
    });

    res.json({
      success: true,
      message: "Open the URL to connect your Google account.",
      authUrl,
    });
  } catch (error) {
    console.error("Google auth URL error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not start Google authentication.",
    });
  }
});

router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    pendingStates.clear();
    return res.status(400).send(
      "Google authorization was cancelled or denied. Return to the RevOps Agent and try again."
    );
  }

  if (
    typeof state !== "string" ||
    !pendingStates.has(state) ||
    pendingStates.get(state) < Date.now()
  ) {
    return res.status(400).send(
      "Invalid or expired OAuth state. Restart Google authentication."
    );
  }

  pendingStates.delete(state);

  if (typeof code !== "string") {
    return res.status(400).send("Google did not return an authorization code.");
  }

  try {
    const { tokens } = await oauthClient.getToken(code);
    savedTokens = tokens;
    oauthClient.setCredentials(savedTokens);

    const oauth2 = google.oauth2({
      auth: oauthClient,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    res.send(`
      <!doctype html>
      <html>
        <head><title>Google Connected</title></head>
        <body style="font-family:Arial,sans-serif;padding:40px">
          <h2>Google connected successfully!</h2>
          <p>Account: ${String(data.email ?? "Connected").replace(/[&<>"']/g, "")}</p>
          <p>You can close this page and return to the RevOps Agent.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Google callback error:", err.message);
    res.status(500).send(
      "Google authentication failed. Check the backend terminal and OAuth configuration."
    );
  }
});

router.get("/status", async (req, res) => {
  if (!savedTokens) {
    return res.json({
      success: true,
      connected: false,
      message: "Google account is not connected in this server session.",
    });
  }

  try {
    oauthClient.setCredentials(savedTokens);

    const oauth2 = google.oauth2({
      auth: oauthClient,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    res.json({
      success: true,
      connected: true,
      email: data.email ?? null,
    });
  } catch (error) {
    console.error("Google status error:", error.message);
    res.status(500).json({
      success: false,
      connected: false,
      message: "Could not verify Google connection.",
    });
  }
});

function requireGoogleConnection(res) {
  if (!savedTokens) {
    res.status(401).json({
      success: false,
      message: "Connect Google first using GET /api/google/auth.",
    });
    return false;
  }

  oauthClient.setCredentials(savedTokens);
  return true;
}

router.get("/gmail", async (req, res) => {
  if (!requireGoogleConnection(res)) return;

  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauthClient,
    });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "newer_than:30d",
    });

    const messages = await Promise.all(
      (response.data.messages ?? []).map(async (message) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });

        const headers = detail.data.payload?.headers ?? [];
        const header = (name) =>
          headers.find(
            (item) => item.name?.toLowerCase() === name.toLowerCase()
          )?.value ?? "";

        return {
          id: detail.data.id,
          threadId: detail.data.threadId,
          from: header("From"),
          to: header("To"),
          subject: header("Subject"),
          date: header("Date"),
          snippet: detail.data.snippet ?? "",
        };
      })
    );

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Gmail API error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not retrieve Gmail messages.",
    });
  }
});

router.get("/calendar", async (req, res) => {
  if (!requireGoogleConnection(res)) return;

  try {
    const calendar = google.calendar({
      version: "v3",
      auth: oauthClient,
    });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = (response.data.items ?? []).map((event) => ({
      id: event.id,
      summary: event.summary ?? "(No title)",
      start: event.start?.dateTime ?? event.start?.date ?? null,
      end: event.end?.dateTime ?? event.end?.date ?? null,
      status: event.status ?? null,
      attendees: (event.attendees ?? []).map((person) => ({
        email: person.email,
        responseStatus: person.responseStatus,
      })),
    }));

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Calendar API error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not retrieve Calendar events.",
    });
  }
});


export async function sendGmailMessage({ to, subject, body }) {
  const allowedRecipients = (process.env.GMAIL_ALLOWED_RECIPIENTS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const recipient =
    process.env.TEST_RECIPIENT_EMAIL ||
    process.env.CLIENT_EMAIL ||
    (allowedRecipients.length > 0 ? allowedRecipients[0] : to);

  // If Google OAuth tokens are saved in this session, attempt Google API send first
  if (savedTokens) {
    try {
      oauthClient.setCredentials(savedTokens);

      const gmail = google.gmail({
        version: "v1",
        auth: oauthClient,
      });

      const encodeHeader = (value) =>
        `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;

      const message = [
        `To: ${recipient.trim()}`,
        `Subject: ${encodeHeader(subject)}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(body, "utf8").toString("base64"),
      ].join("\r\n");

      const raw = Buffer.from(message, "utf8").toString("base64url");

      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      return {
        messageId: response.data.id,
        threadId: response.data.threadId,
      };
    } catch (oauthErr) {
      console.warn("Direct Google OAuth send failed, falling back to Composio Gmail:", oauthErr.message);
    }
  }

  // Seamless fallback to Composio Gmail which is connected and active
  const { sendGmailEmail } = await import("../services/gmail.service.js");
  return sendGmailEmail({ to: recipient, subject, body });
}


router.get("/scope-check", (req, res) => {
  if (!savedTokens) {
    return res.status(401).json({
      success: false,
      connected: false,
      message: "Reconnect Google first.",
    });
  }

  const scopes = getGrantedScopes();

  res.json({
    success: true,
    connected: true,
    gmailRead: scopes.includes(
      "https://www.googleapis.com/auth/gmail.readonly"
    ),
    gmailSend: scopes.includes(
      "https://www.googleapis.com/auth/gmail.send"
    ),
    calendarRead: scopes.includes(
      "https://www.googleapis.com/auth/calendar.readonly"
    ),
  });
});


export default router;
