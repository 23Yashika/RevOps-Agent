// backend/seed/seed-posthog-data.js
/**
 * PostHog Seeder for Autonomous RevOps Agent
 * 
 * Generates realistic product activity events for all 10 seed companies:
 * - Uses exact HubSpot company IDs from backend/seed/seed-ids.json.
 * - Sets properties.company_id as expected by orchestrator and posthogService.
 * - Simulates distinct profiles:
 *     - Sharply declining (Northwind)
 *     - Delayed/declining (Helios)
 *     - Dormant pilot (Pinecrest)
 *     - Moderate steady (Cascade)
 *     - Sporadic/low (Lumina)
 *     - Stable moderate (Meridian)
 *     - Accelerating high (Orbit)
 *     - Stable healthy (Vitalis)
 *     - High telemetry (Terra)
 *     - Insufficient data / 0 events (Atlas)
 * - Uses PostHog batch ingestion with $insert_id for idempotency.
 * - Bounded polling to verify ingestion queryability.
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { generateSeedData } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_IDS_FILE = path.join(__dirname, "seed-ids.json");

const POSTHOG_HOST = (process.env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/$/, "");
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY || POSTHOG_API_KEY;

// Generate deterministic insert_id
function getDeterministicId(companyId, eventName, timestampStr, index) {
  return createHash("sha256")
    .update(`${companyId}-${eventName}-${timestampStr}-${index}`)
    .digest("hex")
    .slice(0, 32);
}

// Generate events for a company
function generateCompanyEvents(seedItem, companyId, nowMs) {
  const events = [];
  const DAY_MS = 24 * 60 * 60 * 1000;
  const pattern = seedItem.productUsage?.pattern;
  const eventSpecs = seedItem.productUsage?.events || [];

  if (pattern === "insufficient_data" || eventSpecs.length === 0) {
    return []; // Atlas Construction Tech has 0 events
  }

  eventSpecs.forEach((spec) => {
    // 1. Prior period events (days 30 to 15 ago)
    const priorCount = spec.countPrior || 0;
    for (let i = 0; i < priorCount; i++) {
      const dayOffset = 15 + Math.floor((i / Math.max(priorCount, 1)) * 15);
      const timeOffset = (i % 8) * 3600 * 1000 + (i % 60) * 60 * 1000;
      const eventTime = new Date(nowMs - dayOffset * DAY_MS + timeOffset).toISOString();
      const distinctId = `${seedItem.key}-user-${(i % 5) + 1}`;

      events.push({
        event: spec.event,
        distinct_id: distinctId,
        timestamp: eventTime,
        properties: {
          $insert_id: getDeterministicId(companyId, spec.event, eventTime, i),
          company_id: String(companyId),
          company_name: seedItem.company.name,
          environment: "production",
          app_version: "2.4.0",
        },
      });
    }

    // 2. Recent period events (days 14 to 0 ago)
    const recentCount = spec.countRecent || 0;
    for (let i = 0; i < recentCount; i++) {
      const dayOffset = Math.floor((i / Math.max(recentCount, 1)) * 14);
      const timeOffset = (i % 8) * 3600 * 1000 + (i % 60) * 60 * 1000;
      const eventTime = new Date(nowMs - dayOffset * DAY_MS + timeOffset).toISOString();
      const distinctId = `${seedItem.key}-user-${(i % 3) + 1}`;

      events.push({
        event: spec.event,
        distinct_id: distinctId,
        timestamp: eventTime,
        properties: {
          $insert_id: getDeterministicId(companyId, spec.event, eventTime, 10000 + i),
          company_id: String(companyId),
          company_name: seedItem.company.name,
          environment: "production",
          app_version: "2.4.0",
        },
      });
    }
  });

  return events;
}

// Ingest in batches of 50 with retry support
async function ingestBatch(batch, maxRetries = 3) {
  const url = `${POSTHOG_HOST}/batch/`;
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: POSTHOG_API_KEY,
          batch,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Batch ingestion failed (${response.status}): ${errorText}`);
      }

      return await response.json().catch(() => ({}));
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

// Bounded polling verification via HogQL query
async function verifyIngestion(companyIds, maxWaitSeconds = 30) {
  if (!POSTHOG_PERSONAL_API_KEY || !POSTHOG_PROJECT_ID) {
    console.log("Skipping query verification (POSTHOG_PERSONAL_API_KEY or POSTHOG_PROJECT_ID not set).");
    return;
  }

  console.log(`\nVerifying PostHog queryability (polling up to ${maxWaitSeconds}s)...`);
  const queryUrl = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitSeconds * 1000) {
    try {
      const res = await fetch(queryUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: `
              SELECT properties.company_id, count() AS total
              FROM events
              WHERE timestamp >= now() - INTERVAL 30 DAY
                AND properties.company_id IS NOT NULL
              GROUP BY properties.company_id
            `,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rows = data.results || [];
        if (rows.length > 0) {
          console.log(`PostHog query verified! Found ${rows.length} companies with recorded usage:`);
          rows.forEach((r) => {
            console.log(`  - Company ID ${r[0]}: ${r[1]} events`);
          });
          return;
        }
      }
    } catch (e) {
      // Keep polling until timeout
    }

    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 4000));
  }

  console.log("\nNote: Events submitted successfully. PostHog indexing is asynchronous and may take a moment to appear in HogQL queries.");
}

async function main() {
  console.log("=================================================");
  console.log("PostHog Seeder: Starting Activity Event Seeder");
  console.log("=================================================");

  // 1. Verify environment
  if (!POSTHOG_API_KEY) {
    console.error("POSTHOG_API_KEY is missing from environment. Cannot ingest events.");
    process.exitCode = 1;
    return;
  }

  // 2. Load HubSpot ID mapping
  let seedIdsData = {};
  if (fs.existsSync(SEED_IDS_FILE)) {
    try {
      seedIdsData = JSON.parse(fs.readFileSync(SEED_IDS_FILE, "utf-8"));
    } catch (e) {
      console.warn("Could not read seed-ids.json; using fallback IDs.");
    }
  }

  const companiesMap = seedIdsData.companies || {};
  const seedDataset = generateSeedData();
  const nowMs = Date.now();

  const allEvents = [];
  const countsByCompany = {};

  for (const item of seedDataset) {
    const tracked = companiesMap[item.key];
    const companyId = tracked?.companyId || `hs-company-${item.seedId.split("-").pop()}`;
    
    const events = generateCompanyEvents(item, companyId, nowMs);
    countsByCompany[item.company.name] = {
      companyId,
      pattern: item.productUsage?.pattern,
      eventCount: events.length,
    };
    allEvents.push(...events);
  }

  console.log(`Generated ${allEvents.length} events across 10 companies:`);
  Object.entries(countsByCompany).forEach(([name, meta]) => {
    console.log(`  - ${name.padEnd(28)} (ID: ${meta.companyId.padEnd(16)}) -> ${meta.eventCount} events [${meta.pattern}]`);
  });

  // 3. Ingest in chunks of 50
  const BATCH_SIZE = 50;
  console.log(`\nIngesting ${allEvents.length} events in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < allEvents.length; i += BATCH_SIZE) {
    const chunk = allEvents.slice(i, i + BATCH_SIZE);
    try {
      await ingestBatch(chunk);
      process.stdout.write("#");
    } catch (err) {
      console.error(`\nBatch at offset ${i} failed: ${err.message}`);
    }
  }
  console.log("\nBatch submission completed.");

  // 4. Verify queryability
  const activeCompanyIds = Object.values(countsByCompany).map((c) => c.companyId);
  await verifyIngestion(activeCompanyIds, 15);

  console.log("PostHog seeding finished successfully.");
}

main().catch((err) => {
  console.error("PostHog Seeder error:", err.message);
  process.exitCode = 1;
});
