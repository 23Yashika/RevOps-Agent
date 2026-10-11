
import {
  getHubSpotCompanies,
  getHubSpotContacts,
  getHubSpotDeals,
  getHubSpotDealRelationships,
} from "./hubspotService.js";

import {
  mockEmails,
  mockCalendarEvents,
} from "../data/mockRevOpsData.js";

const BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;

const DEMO_MODE = process.env.REVOPS_DEMO_MODE === "true";

console.log("REVOPS DEMO MODE:", process.env.REVOPS_DEMO_MODE);
console.log("DEMO_MODE enabled:", DEMO_MODE);
// ---------------------------------------------
// GOOGLE DATA
// ---------------------------------------------

async function getGoogleData(path) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/google/${path}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        data: [],
        error:
          result.message ||
          result.error ||
          `Google ${path} request failed`,
      };
    }

    return {
      success: true,
      data: Array.isArray(result.data) ? result.data : [],
      error: null,
    };
  } catch (error) {
    console.error(`Google ${path} fetch failed:`, error.message);

    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
}

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
    `${valueOf(contact, "firstname")} ${valueOf(contact, "lastname")}`
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

// Match complete phrases rather than arbitrary substrings.
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
    .map((contact) => normalize(valueOf(contact, "email")))
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

    return matchesContact || matchesDomain || matchesCompany;
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

  // Find the matching company record.
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

  // 2. Overdue close date.
  if (closeDate) {
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

  // 4. Find emails related to this deal.
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
  } else if (!integrationStatus.gmail && !DEMO_MODE) {
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

  // 5. Find associated contacts.
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

  // 6. Find relevant calendar events.
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
  } else if (!integrationStatus.calendar && !DEMO_MODE) {
    evidence.push(
      "Calendar is unavailable. Meeting activity could not be verified."
    );
  }

  // 7. Provide a fallback recommendation.
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
  const [
    companies,
    contacts,
    deals,
    gmailResult,
    calendarResult,
  ] = await Promise.all([
    getHubSpotCompanies(limit),
    getHubSpotContacts(limit),
    getHubSpotDeals(limit),
    getGoogleData("gmail"),
    getGoogleData("calendar"),
  ]);

  // Resolve each deal's real HubSpot associations.
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

  // Select real or synthetic activity.
  const emails = DEMO_MODE
    ? [...gmailResult.data, ...mockEmails]
    : gmailResult.data;

  const events = DEMO_MODE
    ? [...calendarResult.data, ...mockCalendarEvents]
    : calendarResult.data;

  const integrationStatus = {
    hubspot: true,
    gmail: gmailResult.success,
    calendar: calendarResult.success,
  };

  const analyses = enrichedDeals.map((item) => {
    const companyName =
      valueOf(item.company, "name") ||
      valueOf(item.deal, "associatedcompanyname") ||
      valueOf(item.deal, "company") ||
      "";

    const enrichedDeal = {
      ...item.deal,
      company: companyName,
      associatedContacts: item.contacts ?? [],
      properties: {
        ...(item.deal?.properties ?? {}),
        associatedcompanyname: companyName,
      },
    };

    const analysis = analyzeDeal(
      enrichedDeal,
      companies,
      contacts,
      emails,
      events,
      integrationStatus
    );

    return {
      ...analysis,
      associationErrors: item.associationErrors ?? [],
    };
  });

  analyses.sort(
    (a, b) => b.riskScore - a.riskScore
  );

  return {
    success: true,
    generatedAt: new Date().toISOString(),

    mode: DEMO_MODE ? "demo" : "live",

    dataSources: {
      hubspot: "live",
      gmail: DEMO_MODE
        ? "live + synthetic demo data"
        : "live",
      calendar: DEMO_MODE
        ? "live + synthetic demo data"
        : "live",
    },

    summary: {
      companies: companies.length,
      contacts: contacts.length,
      deals: deals.length,

      // These totals include synthetic records in demo mode.
      emailsRetrieved: emails.length,
      calendarEventsRetrieved: events.length,

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
