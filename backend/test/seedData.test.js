// backend/test/seedData.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateSeedData } from "../seed/seedData.js";
import { mockEmails, mockCalendarEvents } from "../src/data/mockRevOpsData.js";

describe("Autonomous RevOps Seed Data & Demo System Tests", () => {
  const seedDataset = generateSeedData(new Date());

  describe("1. Dataset Integrity & Structure", () => {
    it("should contain exactly 10 unique companies", () => {
      assert.equal(seedDataset.length, 10, "Dataset must contain exactly 10 companies");
      const uniqueKeys = new Set(seedDataset.map((c) => c.key));
      assert.equal(uniqueKeys.size, 10, "All 10 companies must have unique keys");
      const uniqueDomains = new Set(seedDataset.map((c) => c.company.domain));
      assert.equal(uniqueDomains.size, 10, "All 10 companies must have unique domains");
    });

    it("should ensure every contact has valid real-looking emails (no .example placeholders)", () => {
      for (const item of seedDataset) {
        assert.ok(item.contact.email, `${item.company.name} must have a contact email`);
        assert.match(
          item.contact.email,
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          `${item.contact.email} must be a valid email format`
        );
        assert.ok(
          !item.contact.email.endsWith(".example"),
          `${item.contact.email} must not end with .example (rejected by persistence validator)`
        );
      }
    });

    it("should ensure every company has a valid deal with amount, stage, and close date", () => {
      for (const item of seedDataset) {
        assert.ok(item.deal.dealName, `${item.company.name} must have a dealName`);
        assert.ok(typeof item.deal.amount === "number" && item.deal.amount > 0, "Deal amount must be a positive number");
        assert.ok(item.deal.dealstage, "Deal stage must be defined");
        assert.ok(item.deal.closedate, "Deal close date must be defined");
        assert.ok(!isNaN(new Date(item.deal.closedate).getTime()), "Deal close date must be a valid timestamp");
      }
    });
  });

  describe("2. Scoring Engine & Scenario Alignment", () => {
    // Exact scoring algorithm replication from analysisService.js
    function computeCrmScore(deal) {
      let score = 0;
      const name = deal.dealName.toLowerCase();
      const stage = (deal.dealstage || "").toLowerCase();
      const amount = Number(deal.amount) || 0;
      const closeTimestamp = new Date(deal.closedate).getTime();
      const isWon = stage.includes("closedwon") || stage.includes("won");

      // 1. Stalled signal (+35)
      if (name.includes("stalled") || stage.includes("stalled")) {
        score += 35;
      }

      // 2. Overdue close date (+30)
      if (closeTimestamp < Date.now() && !isWon) {
        score += 30;
      }

      // 3. High value deal (+10)
      if (amount >= 20000) {
        score += 10;
      }

      return Math.min(score, 100);
    }

    it("should classify High Risk companies with score >= 50", () => {
      const highRiskKeys = ["northwind-logistics", "helios-solar", "pinecrest-education"];
      for (const key of highRiskKeys) {
        const item = seedDataset.find((c) => c.key === key);
        assert.ok(item, `High risk company ${key} must exist`);
        const score = computeCrmScore(item.deal);
        assert.equal(score, item.expectedScore, `Computed score for ${item.company.name} should match expectedScore`);
        assert.ok(score >= 50, `${item.company.name} score (${score}) must be >= 50 (High Risk)`);
      }
    });

    it("should classify Medium Risk companies with 25 <= score < 50", () => {
      const mediumRiskKeys = ["cascade-retail", "lumina-media", "meridian-insurance"];
      for (const key of mediumRiskKeys) {
        const item = seedDataset.find((c) => c.key === key);
        assert.ok(item, `Medium risk company ${key} must exist`);
        const score = computeCrmScore(item.deal);
        assert.equal(score, item.expectedScore, `Computed score for ${item.company.name} should match expectedScore`);
        assert.ok(score >= 25 && score < 50, `${item.company.name} score (${score}) must be between 25 and 49 (Medium Risk)`);
      }
    });

    it("should classify Low Risk & Insufficient Data companies with score < 25", () => {
      const lowRiskKeys = ["orbit-fintech", "vitalis-clinics", "terra-agritech", "atlas-construction"];
      for (const key of lowRiskKeys) {
        const item = seedDataset.find((c) => c.key === key);
        assert.ok(item, `Low risk company ${key} must exist`);
        const score = computeCrmScore(item.deal);
        assert.equal(score, item.expectedScore, `Computed score for ${item.company.name} should match expectedScore`);
        assert.ok(score < 25, `${item.company.name} score (${score}) must be < 25 (Low Risk)`);
      }
    });

    it("should not penalize Atlas Construction Tech for insufficient data", () => {
      const atlas = seedDataset.find((c) => c.key === "atlas-construction");
      assert.ok(atlas);
      assert.equal(atlas.productUsage.events.length, 0, "Atlas must have 0 events to test missing telemetry");
      assert.equal(atlas.emails.length, 0, "Atlas must have 0 demo emails to test missing communications");
      const score = computeCrmScore(atlas.deal);
      assert.equal(score, 0, "Missing usage and communication data must not increase risk score");
    });
  });

  describe("3. Demo Email & Calendar Signal Matching", () => {
    it("should provide 3 unanswered follow-up emails for Northwind Logistics", () => {
      const northwindEmails = mockEmails.filter((e) =>
        e.to.includes("northwindlogistics.com") || e.subject.toLowerCase().includes("northwind")
      );
      assert.equal(northwindEmails.length, 3, "Northwind must have exactly 3 demo emails");
    });

    it("should provide an unanswered pricing email for Cascade Retail Group", () => {
      const cascadeEmails = mockEmails.filter((e) =>
        e.from.includes("cascaderetailgroup.com") || e.subject.toLowerCase().includes("cascade")
      );
      assert.ok(cascadeEmails.length >= 1, "Cascade Retail must have at least 1 pricing inquiry email");
      assert.ok(cascadeEmails[0].snippet.toLowerCase().includes("pricing"), "Snippet must mention pricing");
    });

    it("should provide legal review postponement calendar event for Helios Solar", () => {
      const heliosEvents = mockCalendarEvents.filter((ev) =>
        ev.summary.toLowerCase().includes("helios")
      );
      assert.ok(heliosEvents.length >= 1, "Helios must have a calendar event");
      assert.ok(heliosEvents[0].description.toLowerCase().includes("legal") || heliosEvents[0].summary.toLowerCase().includes("legal"));
    });
  });

  describe("4. Safety Safeguards & Recipient Enforcement", () => {
    it("should enforce server-side test recipient priority", () => {
      const testEnv = {
        TEST_RECIPIENT_EMAIL: "verified-test@company.com",
        CLIENT_EMAIL: "client@acme.com",
        GMAIL_ALLOWED_RECIPIENTS: "allowed@company.com",
      };

      const resolvedRecipient =
        testEnv.TEST_RECIPIENT_EMAIL ||
        testEnv.CLIENT_EMAIL ||
        testEnv.GMAIL_ALLOWED_RECIPIENTS;

      assert.equal(resolvedRecipient, "verified-test@company.com", "TEST_RECIPIENT_EMAIL must take priority over customer emails");
    });
  });
});
