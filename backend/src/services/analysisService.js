
import {
  getHubSpotCompanies,
  getHubSpotContacts,
  getHubSpotDeals,
  getHubSpotDealRelationships,
} from "./hubspotService.js";

import { fetchGmailThreads } from "./gmail.service.js";
import { getCalendarSignals } from "./calendar.service.js";

import {
  mockEmails,
  mockCalendarEvents,
} from "../data/mockRevOpsData.js";

const DEMO_MODE = process.env.REVOPS_DEMO_MODE === "true";

// ---------------------------------------------
// GENERAL HELPERS
// ---------------------------------------------

function propertiesOf(record) {
  return record?.properties ?? record ?? {};
}

function valueOf(record, key) {
  const value = propertiesOf(record)?.[key];

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object" && "value" in value) {
    return value.value ?? "";
  }

  return value;
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function firstValue(...values) {
  return (
    values.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    ) ?? ""
  );
}

function headerValue(headers, name) {
  if (!headers) return "";

  if (Array.isArray(headers)) {
    const found = headers.find(
      (item) => normalize(item?.name) === normalize(name)
    );

    return found?.value ?? "";
  }

  const key = Object.keys(headers).find(
    (item) => normalize(item) === normalize(name)
  );

  return key ? headers[key] ?? "" : "";
}

// ---------------------------------------------
// GMAIL NORMALIZATION
// ---------------------------------------------

function getMessageBody(message) {
  const direct = firstValue(
    message?.snippet,
    message?.bodyPreview,
    message?.body,
    message?.textBody,
    message?.text
  );

  if (typeof direct === "string") {
    return direct;
  }

  const parts = message?.payload?.parts;

  if (Array.isArray(parts)) {
    return parts
      .map((part) =>
        firstValue(
          part?.body?.data,
          part?.body,
          part?.text
        )
      )
      .filter((item) => typeof item === "string")
      .join(" ");
  }

  return "";
}

function normalizeGmailMessage(message, thread = {}) {
  const headers =
    message?.headers ??
    message?.payload?.headers ??
    message?.payload?.header ??
    {};

  const from = firstValue(
    message?.from,
    message?.sender,
    headerValue(headers, "From")
  );

  const to = firstValue(
    message?.to,
    message?.recipients,
    headerValue(headers, "To")
  );

  const subject = firstValue(
    message?.subject,
    headerValue(headers, "Subject"),
    thread?.subject
  );

  const rawDate = firstValue(
    message?.date,
    message?.internalDate,
    headerValue(headers, "Date"),
    thread?.date
  );

  let date = rawDate;

  if (rawDate && /^\d+$/.test(String(rawDate))) {
    const numeric = Number(rawDate);

    date = new Date(
      String(rawDate).length > 11
        ? numeric
        : numeric * 1000
    ).toISOString();
  }

  return {
    id:
      message?.id ??
      message?.messageId ??
      thread?.id ??
      null,

    threadId:
      message?.threadId ??
      thread?.id ??
      null,

    subject: String(subject || ""),

    from:
      typeof from === "object"
        ? JSON.stringify(from)
        : String(from || ""),

    to: Array.isArray(to)
      ? to.join(", ")
      : String(to || ""),

    date: date ? String(date) : "",

    snippet: String(
      firstValue(
        message?.snippet,
        message?.bodyPreview,
        getMessageBody(message)
      ) || ""
    ).slice(0, 1200),

    demo: false,
  };
}

function extractThreads(result) {
  const data = result?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.threads)) return data.threads;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(result?.threads)) return result.threads;
  if (Array.isArray(result?.items)) return result.items;

  return [];
}

function normalizeGmailThreads(result) {
  if (result?.successful === false) {
    const message =
      typeof result.error === "string"
        ? result.error
        : result.error?.message;

    throw new Error(
      message || "Composio Gmail request failed."
    );
  }

  const threads = extractThreads(result);
  const messages = [];

  for (const thread of threads) {
    const nested = Array.isArray(thread?.messages)
      ? thread.messages
      : Array.isArray(thread?.data?.messages)
        ? thread.data.messages
        : null;

    if (nested?.length) {
      for (const message of nested) {
        messages.push(
          normalizeGmailMessage(message, thread)
        );
      }
    } else {
      messages.push(
        normalizeGmailMessage(thread, thread)
      );
    }
  }

  return messages;
}

// ---------------------------------------------
// MATCHING HELPERS
// ---------------------------------------------

function getEmailText(email) {
  return normalize(
    [
      email?.subject,
      email?.snippet,
      email?.from,
      email?.to,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getEventText(event) {
  return normalize(
    [
      event?.summary,
      event?.description,
      event?.location,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getContactName(contact) {
  return normalize(
    `${valueOf(contact, "firstname")} ${valueOf(
      contact,
      "lastname"
    )}`
  );
}

function getCompanyDomain(company) {
  const rawDomain =
    valueOf(company, "domain") ||
    valueOf(company, "website");

  return normalize(rawDomain)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(":")[0];
}

function containsPhrase(text, phrase) {
  const normalizedText = normalize(text);
  const normalizedPhrase = normalize(phrase);

  if (!normalizedText || !normalizedPhrase) {
    return false;
  }

  const escapedPhrase = normalizedPhrase.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapedPhrase}($|[^a-z0-9])`,
    "i"
  );

  return pattern.test(normalizedText);
}

function getCompanySearchNames(companyName, company) {
  const names = [
    companyName,
    valueOf(company, "name"),
  ]
    .map(normalize)
    .filter(Boolean);

  const shorterNames = names
    .map((name) =>
      name.replace(/^revops demo\s*-\s*/, "").trim()
    )
    .filter((name) => name.length >= 4);

  return [...new Set([...names, ...shorterNames])];
}

// ---------------------------------------------
// EMAIL MATCHING
// ---------------------------------------------

function findRelatedEmails({
  companyName,
  company,
  associatedContacts,
  emails,
}) {
  const domain = getCompanyDomain(company);

  const companyNames = getCompanySearchNames(
    companyName,
    company
  );

  const contactEmails = associatedContacts
    .map((contact) =>
      normalize(valueOf(contact, "email"))
    )
    .filter(Boolean);

  return emails.filter((email) => {
    const text = getEmailText(email);

    const matchesContact = contactEmails.some(
      (address) => containsPhrase(text, address)
    );

    const matchesDomain =
      Boolean(domain) && containsPhrase(text, domain);

    const matchesCompany = companyNames.some(
      (name) => containsPhrase(text, name)
    );

    return (
      matchesContact ||
      matchesDomain ||
      matchesCompany
    );
  });
}

// ---------------------------------------------
// CALENDAR MATCHING
// ---------------------------------------------

function findRelatedEvents({
  companyName,
  company,
  associatedContacts,
  events,
}) {
  const domain = getCompanyDomain(company);

  const companyNames = getCompanySearchNames(
    companyName,
    company
  );

  const contactNames = associatedContacts
    .map(getContactName)
    .filter((name) => name.length >= 3);

  const searchNames = [
    ...new Set([...companyNames, ...contactNames]),
  ];

  return events.filter((event) => {
    const text = getEventText(event);

    const matchesDomain =
      Boolean(domain) && containsPhrase(text, domain);

    const matchesName = searchNames.some(
      (name) => containsPhrase(text, name)
    );

    return matchesDomain || matchesName;
  });
}

// ---------------------------------------------
// DEAL RISK ANALYSIS
// ---------------------------------------------

function analyzeDeal(
  deal,
  companies,
  contacts,
  emails,
  events,
  integrationStatus
) {
  const name =
    valueOf(deal, "dealname") || "Unnamed deal";

  const stage = normalize(valueOf(deal, "dealstage"));
  const amount = Number(valueOf(deal, "amount")) || 0;
  const closeDate = valueOf(deal, "closedate");

  const companyName =
    deal.company ||
    valueOf(deal, "associatedcompanyname") ||
    "";

  const company =
    companies.find(
      (item) =>
        normalize(valueOf(item, "name")) ===
        normalize(companyName)
    ) ?? null;

  const associatedContacts = Array.isArray(
    deal.associatedContacts
  )
    ? deal.associatedContacts
    : [];

  const evidence = [];
  const recommendations = [];

  let score = 0;

  // 1. Stalled-deal signal.
  if (
    normalize(name).includes("stalled") ||
    stage.includes("stalled")
  ) {
    score += 35;

    evidence.push(
      "The deal name or stage indicates a potentially stalled deal."
    );

    recommendations.push(
      "Review the last customer interaction and agree on a concrete next step."
    );
  }

  // 2. Overdue close date (exclude deals already won).
  const isClosedWon = stage.includes("closedwon") || stage.includes("closed won") || stage === "won";
  if (closeDate && !isClosedWon) {
    const closeTimestamp = new Date(closeDate).getTime();

    if (
      Number.isFinite(closeTimestamp) &&
      closeTimestamp < Date.now()
    ) {
      score += 30;

      evidence.push(
        `The close date (${closeDate}) is in the past.`
      );

      recommendations.push(
        "Review the close date and confirm the next milestone with the customer."
      );
    }
  }

  // 3. Deal value.
  if (amount >= 20000) {
    score += 10;

    evidence.push(
      `This deal has a value of ${amount}.`
    );
  }

  // 4. Related emails.
  const relatedEmails = findRelatedEmails({
    companyName,
    company,
    associatedContacts,
    emails,
  });

  if (relatedEmails.length > 0) {
    evidence.push(
      `${relatedEmails.length} email(s) matched the deal or company.`
    );
  } else if (!integrationStatus.gmail) {
    evidence.push(
      "Gmail is unavailable. Email activity could not be verified."
    );
  } else {
    evidence.push(
      "No matching email was found. This alone does not establish deal risk."
    );

    recommendations.push(
      "Review recent customer correspondence before deciding on the next action."
    );
  }

  // 5. Associated contacts.
  const relatedContacts =
    associatedContacts.length > 0
      ? associatedContacts
      : contacts.filter((contact) => {
          const contactCompany = normalize(
            valueOf(contact, "company")
          );

          return (
            Boolean(companyName) &&
            Boolean(contactCompany) &&
            contactCompany === normalize(companyName)
          );
        });

  if (relatedContacts.length > 0) {
    evidence.push(
      `${relatedContacts.length} contact(s) are associated with or matched to this deal.`
    );
  } else {
    evidence.push(
      "No associated contact was found for this deal."
    );
  }

  // Keep normalized contact details available for later approval-gated actions.
  // Do not guess a recipient when multiple contacts have email addresses.
  const normalizedContacts = relatedContacts.map((contact) => ({
    id: contact?.id ? String(contact.id) : null,
    firstName: String(valueOf(contact, "firstname") || ""),
    lastName: String(valueOf(contact, "lastname") || ""),
    email: String(valueOf(contact, "email") || "").trim(),
  })).filter((contact) => contact.email);

  const uniqueContactEmails = new Map(
    normalizedContacts.map((contact) => [contact.email.toLowerCase(), contact])
  );

  const primaryContact = uniqueContactEmails.size === 1
    ? [...uniqueContactEmails.values()][0]
    : null;

  // 6. Related calendar events.
  const relatedEvents = findRelatedEvents({
    companyName,
    company,
    associatedContacts,
    events,
  });

  if (relatedEvents.length > 0) {
    evidence.push(
      `${relatedEvents.length} calendar event(s) matched the company or contacts.`
    );
  } else if (!integrationStatus.calendar) {
    evidence.push(
      "Calendar is unavailable. Meeting activity could not be verified."
    );
  }

  // 7. Fallback recommendation.
  if (recommendations.length === 0) {
    if (relatedEvents.length > 0) {
      recommendations.push(
        "Review the upcoming meeting and prepare a deal update."
      );
    } else if (relatedEmails.length > 0) {
      recommendations.push(
        "Review the latest customer email and confirm the next follow-up."
      );
    } else {
      recommendations.push(
        "Review recent customer activity and confirm the next follow-up."
      );
    }
  }

  score = Math.min(score, 100);

  return {
    dealId: deal.id ?? null,
    dealName: name,
    company: companyName || null,
    stage: valueOf(deal, "dealstage") || "Unknown",
    amount,
    closeDate: closeDate || null,

    // Additive fields: existing consumers can ignore them.
    // primaryContact is null if the recipient is ambiguous.
    contacts: normalizedContacts,
    primaryContact,

    riskScore: score,

    riskLevel:
      score >= 50
        ? "high"
        : score >= 25
          ? "medium"
          : "low",

    evidence,
    recommendations,

    dataCoverage: {
      companyMatched: Boolean(company),
      associatedContacts: relatedContacts.length,
      emailsAvailable: integrationStatus.gmail,
      matchingEmails: relatedEmails.length,
      calendarAvailable: integrationStatus.calendar,
      matchingEvents: relatedEvents.length,
    },

    matchedEmails: relatedEmails.map((email) => ({
      subject: email.subject ?? "",
      from: email.from ?? "",
      to: email.to ?? "",
      date: email.date ?? "",
      snippet: email.snippet ?? "",
      demo: Boolean(email.demo),
    })),

    matchedEvents: relatedEvents.map((event) => ({
      summary: event.summary ?? "",
      start: event.start ?? null,
      description: event.description ?? "",
      demo: Boolean(event.demo),
    })),
  };
}

// ---------------------------------------------
// MAIN REVOPS ANALYSIS
// ---------------------------------------------

export async function getRevOpsAnalysis(limit = 10) {
  const fetchLimit = DEMO_MODE ? Math.max(limit, 25) : limit;

  // Step 1: Retrieve HubSpot data.
  const [companies, contacts, deals] = await Promise.all([
    getHubSpotCompanies(fetchLimit),
    getHubSpotContacts(fetchLimit),
    getHubSpotDeals(fetchLimit),
  ]);

  // Step 2: Retrieve Gmail and Calendar data directly.
  const [gmailResult, calendarResult] = await Promise.all([
    (async () => {
      try {
        const raw = await fetchGmailThreads({
          maxResults: 25,
          query: "newer_than:90d",
          verbose: true,
        });

        return {
          success: true,
          data: normalizeGmailThreads(raw),
          error: null,
        };
      } catch (error) {
        console.error(
          "Composio Gmail fetch failed:",
          error.message
        );

        return {
          success: false,
          data: [],
          error: error.message || "Gmail fetch failed",
        };
      }
    })(),

    (async () => {
      try {
        const normalized = await getCalendarSignals({
          maxResults: 100,
        });

        const realEvents = normalized.map((event) => ({
          ...event,
          summary: event.title,
          demo: false,
        }));

        return {
          success: true,
          data: realEvents,
          error: null,
        };
      } catch (error) {
        console.error(
          "Composio Calendar fetch failed:",
          error.message
        );

        return {
          success: false,
          data: [],
          error: error.message || "Calendar fetch failed",
        };
      }
    })(),
  ]);

  // Step 3: Resolve actual HubSpot associations.
  const enrichedDeals = await Promise.all(
    deals.map(async (deal) => {
      try {
        return await getHubSpotDealRelationships(deal);
      } catch (error) {
        console.error(
          `Failed to enrich deal ${deal.id}:`,
          error.message
        );

        return {
          deal,
          company: null,
          contacts: [],
          associationErrors: [error.message],
        };
      }
    })
  );

  // Step 4: Separate live records from synthetic records.
  const liveEmails = gmailResult.data;
  const liveEvents = calendarResult.data;

  const emails = DEMO_MODE
    ? [...liveEmails, ...mockEmails]
    : liveEmails;

  const events = DEMO_MODE
    ? [...liveEvents, ...mockCalendarEvents]
    : liveEvents;

  const integrationStatus = {
    hubspot: true,
    gmail: gmailResult.success,
    calendar: calendarResult.success,
  };

  // Step 5: Analyze each deal.
  const analyses = enrichedDeals.map((item) => {
    const companyName =
      valueOf(item.company, "name") ||
      valueOf(item.deal, "associatedcompanyname") ||
      valueOf(item.deal, "company") ||
      "";

    const enrichedDeal = {
      ...item.deal,
      company: companyName,

      companyId: item.company?.id
        ? String(item.company.id)
        : null,

      associatedContacts: item.contacts ?? [],

      properties: {
        ...(item.deal?.properties ?? {}),
        associatedcompanyname: companyName,
      },
    };

    return {
      ...analyzeDeal(
        enrichedDeal,
        companies,
        contacts,
        emails,
        events,
        integrationStatus
      ),

      companyId: item.company?.id
        ? String(item.company.id)
        : null,

      associationErrors: item.associationErrors ?? [],
    };
  });

  analyses.sort((a, b) => b.riskScore - a.riskScore);

  // Step 6: Return the unified analysis.
  return {
    success: true,
    generatedAt: new Date().toISOString(),

    mode: DEMO_MODE ? "demo" : "live",

    dataSources: {
      hubspot: "live",

      gmail: !gmailResult.success
        ? "unavailable"
        : DEMO_MODE
          ? "live + synthetic demo data"
          : "live",

      calendar: !calendarResult.success
        ? "unavailable"
        : DEMO_MODE
          ? "live + synthetic demo data"
          : "live",
    },

    summary: {
      companies: companies.length,
      contacts: contacts.length,
      deals: deals.length,

      emailsRetrieved: emails.length,
      calendarEventsRetrieved: events.length,

      liveEmails: liveEmails.length,
      liveCalendarEvents: liveEvents.length,

      demoEmails: DEMO_MODE ? mockEmails.length : 0,

      demoCalendarEvents: DEMO_MODE
        ? mockCalendarEvents.length
        : 0,

      highRiskDeals: analyses.filter(
        (deal) => deal.riskLevel === "high"
      ).length,

      mediumRiskDeals: analyses.filter(
        (deal) => deal.riskLevel === "medium"
      ).length,

      lowRiskDeals: analyses.filter(
        (deal) => deal.riskLevel === "low"
      ).length,
    },

    integrations: integrationStatus,

    integrationErrors: {
      gmail: gmailResult.error,
      calendar: calendarResult.error,
    },

    deals: analyses,
  };
}
