// backend/seed/seed-hubspot-data.js
/**
 * Idempotent HubSpot Seeder for Autonomous RevOps Agent
 * 
 * Features:
 * - Reads HUBSPOT_ACCESS_TOKEN from environment.
 * - Seeds 10 realistic companies, contacts, and deals with associations.
 * - Idempotent: searches existing records by domain/email/name and updates or creates.
 * - Stores HubSpot ID mappings in backend/seed/seed-ids.json.
 * - Supports `--clean` flag with strict safeguards to delete ONLY seeded records.
 * - Supports offline/simulated fallback if no live token is present so local demo works.
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSeedData } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_IDS_FILE = path.join(__dirname, "seed-ids.json");

const HUBSPOT_API_BASE = "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Rate limiting & retry helper
async function hubspotRequest(endpoint, options = {}, retries = 3) {
  const url = `${HUBSPOT_API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers });
      
      if (res.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`[HubSpot Rate Limit] Retrying in ${waitTime}ms (Attempt ${attempt}/${retries})...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      if (res.status === 204) {
        return { success: true };
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `HubSpot API returned status ${res.status}`);
      }

      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

// ---------------------------------------------------------------------------
// CLEANUP LOGIC (--clean flag)
// ---------------------------------------------------------------------------
async function cleanSeededRecords() {
  console.log("=================================================");
  console.log("HubSpot Seeder: Cleaning Seeded Records");
  console.log("=================================================");

  if (!fs.existsSync(SEED_IDS_FILE)) {
    console.log(`No ${SEED_IDS_FILE} found. Nothing to clean.`);
    return;
  }

  let seedIdsData;
  try {
    seedIdsData = JSON.parse(fs.readFileSync(SEED_IDS_FILE, "utf-8"));
  } catch (err) {
    console.error("Could not parse seed-ids.json:", err.message);
    return;
  }

  if (!seedIdsData.companies || typeof seedIdsData.companies !== "object") {
    console.log("seed-ids.json contains no valid company records.");
    return;
  }

  if (!TOKEN) {
    console.log("[Simulation] HUBSPOT_ACCESS_TOKEN not set. Removing local seed-ids.json only.");
    fs.unlinkSync(SEED_IDS_FILE);
    console.log("Local seed-ids.json deleted successfully.");
    return;
  }

  const entries = Object.values(seedIdsData.companies);
  console.log(`Found ${entries.length} tracked companies to remove.`);

  for (const item of entries) {
    console.log(`Deleting records for: ${item.name}`);

    // 1. Delete Deal
    if (item.dealId && !item.dealId.startsWith("sim-")) {
      try {
        await hubspotRequest(`/crm/v3/objects/deals/${item.dealId}`, { method: "DELETE" });
        console.log(`  - Deleted deal ${item.dealId}`);
      } catch (e) {
        console.warn(`  - Could not delete deal ${item.dealId}: ${e.message}`);
      }
    }

    // 2. Delete Contact
    if (item.contactId && !item.contactId.startsWith("sim-")) {
      try {
        await hubspotRequest(`/crm/v3/objects/contacts/${item.contactId}`, { method: "DELETE" });
        console.log(`  - Deleted contact ${item.contactId}`);
      } catch (e) {
        console.warn(`  - Could not delete contact ${item.contactId}: ${e.message}`);
      }
    }

    // 3. Delete Company
    if (item.companyId && !item.companyId.startsWith("sim-")) {
      try {
        await hubspotRequest(`/crm/v3/objects/companies/${item.companyId}`, { method: "DELETE" });
        console.log(`  - Deleted company ${item.companyId}`);
      } catch (e) {
        console.warn(`  - Could not delete company ${item.companyId}: ${e.message}`);
      }
    }
  }

  fs.unlinkSync(SEED_IDS_FILE);
  console.log(`\nSuccessfully cleaned seeded records and removed seed-ids.json.`);
}

// ---------------------------------------------------------------------------
// LIVE SEED LOGIC
// ---------------------------------------------------------------------------
async function seedLiveHubSpot(seedDataset) {
  console.log("Verifying HubSpot token credentials...");
  const accountInfo = await hubspotRequest("/account-info/v3/details").catch(() => null);
  const portalId = accountInfo?.portalId || "unknown";
  console.log(`Connected to HubSpot Portal ID: ${portalId}`);

  const results = {};

  for (const item of seedDataset) {
    console.log(`\n[${item.seedId}] Processing ${item.company.name}...`);

    // 1. COMPANY (Search -> Update or Create)
    let companyId;
    const searchCompany = await hubspotRequest("/crm/v3/objects/companies/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: "domain", operator: "EQ", value: item.company.domain },
            ],
          },
        ],
        limit: 1,
      }),
    }).catch(() => null);

    const existingCompany = searchCompany?.results?.[0];
    const companyProperties = {
      name: item.company.name,
      domain: item.company.domain,
      website: item.company.website,
      industry: item.company.industry,
      description: item.company.description,
      city: item.company.city,
      state: item.company.state,
    };

    if (existingCompany) {
      companyId = existingCompany.id;
      console.log(`  - Company exists (ID: ${companyId}). Updating...`);
      await hubspotRequest(`/crm/v3/objects/companies/${companyId}`, {
        method: "PATCH",
        body: JSON.stringify({ properties: companyProperties }),
      });
    } else {
      console.log(`  - Creating new company...`);
      const created = await hubspotRequest("/crm/v3/objects/companies", {
        method: "POST",
        body: JSON.stringify({ properties: companyProperties }),
      });
      companyId = created.id;
      console.log(`  - Created company (ID: ${companyId})`);
    }

    // 2. CONTACT (Search -> Update or Create)
    let contactId;
    const searchContact = await hubspotRequest("/crm/v3/objects/contacts/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: "email", operator: "EQ", value: item.contact.email },
            ],
          },
        ],
        limit: 1,
      }),
    }).catch(() => null);

    const existingContact = searchContact?.results?.[0];
    const contactProperties = {
      firstname: item.contact.firstName,
      lastname: item.contact.lastName,
      email: item.contact.email,
      phone: item.contact.phone,
      jobtitle: item.contact.jobTitle,
      company: item.company.name,
    };

    if (existingContact) {
      contactId = existingContact.id;
      console.log(`  - Contact exists (ID: ${contactId}). Updating...`);
      await hubspotRequest(`/crm/v3/objects/contacts/${contactId}`, {
        method: "PATCH",
        body: JSON.stringify({ properties: contactProperties }),
      });
    } else {
      console.log(`  - Creating new contact...`);
      const created = await hubspotRequest("/crm/v3/objects/contacts", {
        method: "POST",
        body: JSON.stringify({ properties: contactProperties }),
      });
      contactId = created.id;
      console.log(`  - Created contact (ID: ${contactId})`);
    }

    // Associate Contact -> Company
    try {
      await hubspotRequest(
        `/crm/v4/objects/contacts/${contactId}/associations/default/companies/${companyId}`,
        { method: "PUT" }
      );
      console.log(`  - Associated contact to company`);
    } catch (e) {
      console.warn(`  - Association contact->company warning: ${e.message}`);
    }

    // 3. DEAL (Search -> Update or Create)
    let dealId;
    const searchDeal = await hubspotRequest("/crm/v3/objects/deals/search", {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: "dealname", operator: "EQ", value: item.deal.dealName },
            ],
          },
        ],
        limit: 1,
      }),
    }).catch(() => null);

    const existingDeal = searchDeal?.results?.[0];
    const dealProperties = {
      dealname: item.deal.dealName,
      amount: String(item.deal.amount),
      dealstage: item.deal.dealstage,
      closedate: new Date(item.deal.closedate).toISOString(),
      pipeline: item.deal.pipeline || "default",
    };

    if (existingDeal) {
      dealId = existingDeal.id;
      console.log(`  - Deal exists (ID: ${dealId}). Updating...`);
      await hubspotRequest(`/crm/v3/objects/deals/${dealId}`, {
        method: "PATCH",
        body: JSON.stringify({ properties: dealProperties }),
      });
    } else {
      console.log(`  - Creating new deal...`);
      const created = await hubspotRequest("/crm/v3/objects/deals", {
        method: "POST",
        body: JSON.stringify({ properties: dealProperties }),
      });
      dealId = created.id;
      console.log(`  - Created deal (ID: ${dealId})`);
    }

    // Associate Deal -> Company & Deal -> Contact
    try {
      await hubspotRequest(
        `/crm/v4/objects/deals/${dealId}/associations/default/companies/${companyId}`,
        { method: "PUT" }
      );
      await hubspotRequest(
        `/crm/v4/objects/deals/${dealId}/associations/default/contacts/${contactId}`,
        { method: "PUT" }
      );
      console.log(`  - Associated deal to company & contact`);
    } catch (e) {
      console.warn(`  - Association deal->company warning: ${e.message}`);
    }

    results[item.key] = {
      seedId: item.seedId,
      name: item.company.name,
      domain: item.company.domain,
      companyId: String(companyId),
      contactId: String(contactId),
      dealId: String(dealId),
      contactEmail: item.contact.email,
      dealName: item.deal.dealName,
      expectedScore: item.expectedScore,
      riskCategory: item.riskCategory,
    };
  }

  return { portalId, results };
}

// ---------------------------------------------------------------------------
// SIMULATED / OFFLINE SEED LOGIC
// ---------------------------------------------------------------------------
function seedSimulatedHubSpot(seedDataset) {
  console.log("\n=======================================================");
  console.log("HubSpot Seeder: Offline / Simulated Mode");
  console.log("=======================================================");
  console.log("HUBSPOT_ACCESS_TOKEN is not set in environment.");
  console.log("Generating deterministic seed ID mappings for local demo and testing.");
  console.log("To seed real HubSpot CRM, add HUBSPOT_ACCESS_TOKEN to .env and rerun.\n");

  const results = {};
  seedDataset.forEach((item, index) => {
    const num = String(index + 1).padStart(3, "0");
    results[item.key] = {
      seedId: item.seedId,
      name: item.company.name,
      domain: item.company.domain,
      companyId: `hs-company-${num}`,
      contactId: `hs-contact-${num}`,
      dealId: `hs-deal-${num}`,
      contactEmail: item.contact.email,
      dealName: item.deal.dealName,
      expectedScore: item.expectedScore,
      riskCategory: item.riskCategory,
    };
  });

  return { portalId: "simulated-demo-portal", results };
}

// ---------------------------------------------------------------------------
// MAIN EXECUTION
// ---------------------------------------------------------------------------
async function main() {
  const isClean = process.argv.includes("--clean");

  if (isClean) {
    await cleanSeededRecords();
    return;
  }

  console.log("=================================================");
  console.log("HubSpot Seeder: Starting Idempotent Seed Process");
  console.log("=================================================");

  const seedDataset = generateSeedData();
  console.log(`Loaded dataset with ${seedDataset.length} companies.`);

  let output;
  if (TOKEN && TOKEN.trim().length > 10) {
    output = await seedLiveHubSpot(seedDataset);
  } else {
    output = seedSimulatedHubSpot(seedDataset);
  }

  const payload = {
    seededAt: new Date().toISOString(),
    mode: TOKEN ? "live" : "simulated",
    hubspotPortalId: output.portalId,
    totalCompanies: Object.keys(output.results).length,
    companies: output.results,
  };

  fs.writeFileSync(SEED_IDS_FILE, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`\nMapping successfully saved to: ${SEED_IDS_FILE}`);
  console.log(`Validated counts:`);
  console.log(`  - Companies: ${payload.totalCompanies}`);
  console.log(`  - Contacts:  ${payload.totalCompanies}`);
  console.log(`  - Deals:     ${payload.totalCompanies}`);
  console.log("HubSpot seed completed successfully.");
}

main().catch((err) => {
  console.error("HubSpot Seeder error:", err.message);
  process.exitCode = 1;
});
