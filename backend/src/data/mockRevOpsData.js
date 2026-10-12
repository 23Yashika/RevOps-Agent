// backend/src/data/mockRevOpsData.js
import { generateSeedData } from "../../seed/seedData.js";

const seedData = generateSeedData();

// Extract all emails and calendar events from the 10 seed companies
const seedEmails = seedData.flatMap((item) => item.emails || []);
const seedCalendarEvents = seedData.flatMap((item) => item.calendarEvents || []);

// Legacy demo records kept for backward compatibility with pre-existing tests/demos
const legacyMockEmails = [
  {
    id: "demo-email-acme-1",
    subject: "Follow-up on Acme implementation proposal",
    from: "sales@revops-agent.internal",
    to: "alex.morgan@acme-demo.internal",
    date: "2026-10-09T10:00:00Z",
    snippet:
      "We have followed up twice regarding the Acme proposal but have not received a response. Could we confirm the next steps?",
    demo: true,
  },
  {
    id: "demo-email-globex-1",
    subject: "Globex renewal discussion",
    from: "sales@revops-agent.internal",
    to: "taylor.chen@globex-demo.internal",
    date: "2026-10-10T09:00:00Z",
    snippet:
      "We would like to discuss the Globex renewal, review requirements, and confirm the renewal timeline.",
    demo: true,
  },
  {
    id: "demo-email-initech-1",
    subject: "Initech expansion pricing request",
    from: "sales@revops-agent.internal",
    to: "jordan.lee@initech-demo.internal",
    date: "2026-10-10T11:00:00Z",
    snippet:
      "The Initech team requested updated pricing for the proposed expansion. Please prepare the revised proposal.",
    demo: true,
  },
];

const legacyMockCalendarEvents = [
  {
    id: "demo-event-acme-1",
    summary: "Acme follow-up call",
    description:
      "Discuss the stalled proposal, customer concerns, and agreed next steps.",
    start: "2026-10-12T10:00:00Z",
    demo: true,
  },
  {
    id: "demo-event-globex-1",
    summary: "Globex renewal review",
    description:
      "Review renewal requirements, outstanding questions, and contract timing.",
    start: "2026-10-13T09:00:00Z",
    demo: true,
  },
  {
    id: "demo-event-initech-1",
    summary: "Initech expansion planning",
    description:
      "Discuss expansion scope and the revised pricing proposal.",
    start: "2026-10-14T11:00:00Z",
    demo: true,
  },
];

export const mockEmails = [...seedEmails, ...legacyMockEmails];
export const mockCalendarEvents = [...seedCalendarEvents, ...legacyMockCalendarEvents];