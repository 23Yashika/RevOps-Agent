
import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

const USER_ID = process.env.COMPOSIO_USER_ID;
const CALENDAR_ACCOUNT_ID =
  process.env.COMPOSIO_CALENDAR_ACCOUNT_ID;

function ensureConfig() {
  if (
    !process.env.COMPOSIO_API_KEY ||
    !USER_ID ||
    !CALENDAR_ACCOUNT_ID
  ) {
    throw new Error(
      "Missing COMPOSIO_API_KEY, COMPOSIO_USER_ID, or COMPOSIO_CALENDAR_ACCOUNT_ID in backend .env"
    );
  }
}

/**
 * List calendars accessible to the connected Google account.
 */
export async function listGoogleCalendars() {
  ensureConfig();

  return composio.tools.execute(
    "GOOGLECALENDAR_LIST_CALENDARS",
    {
      userId: USER_ID,
      connectedAccountId: CALENDAR_ACCOUNT_ID,
      arguments: {
        max_results: 10,
      },
      version: "20261010_00",
    }
  );
}

/**
 * Fetch events from Google Calendar.
 * Defaults to events from now through the next 30 days.
 */
export async function fetchCalendarEvents({
  calendarId = "primary",
  maxResults = 20,
  timeMin,
  timeMax,
  query = "",
} = {}) {
  ensureConfig();

  const now = new Date();

  const start = timeMin || now.toISOString();

  const end =
    timeMax ||
    new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

  const safeMaxResults = Math.min(
    Math.max(Number(maxResults) || 20, 1),
    100
  );

  return composio.tools.execute(
    "GOOGLECALENDAR_EVENTS_LIST",
    {
      userId: USER_ID,
      connectedAccountId: CALENDAR_ACCOUNT_ID,
      arguments: {
        calendarId,
        maxResults: safeMaxResults,
        timeMin: start,
        timeMax: end,
        singleEvents: true,
        orderBy: "startTime",
        ...(query ? { query } : {}),
        fields:
          "items(id,summary,description,start,end,status,htmlLink,attendees,organizer),nextPageToken",
      },
      version: "20261010_00",
    }
  );
}

/**
 * Return normalized calendar events for the RevOps Agent.
 */
export async function getCalendarSignals({
  maxResults = 20,
  timeMin,
  timeMax,
  query = "",
} = {}) {
  const result = await fetchCalendarEvents({
    maxResults,
    timeMin,
    timeMax,
    query,
  });

  if (!result.successful) {
    const message =
      typeof result.error === "string"
        ? result.error
        : result.error?.message;

    throw new Error(
      message || "Failed to fetch Google Calendar events."
    );
  }

  const events = result.data?.items || [];

  return events.map((event) => ({
    id: event.id,
    title: event.summary || "(Untitled event)",
    description: event.description || "",
    start:
      event.start?.dateTime ||
      event.start?.date ||
      null,
    end:
      event.end?.dateTime ||
      event.end?.date ||
      null,
    status: event.status || "unknown",
    attendees: (event.attendees || []).map(
      (attendee) => ({
        email: attendee.email || null,
        responseStatus:
          attendee.responseStatus || null,
      })
    ),
    organizerEmail:
      event.organizer?.email || null,
    link: event.htmlLink || null,
  }));
}
