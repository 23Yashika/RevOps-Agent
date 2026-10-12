# Seed Data & Demo System for Autonomous RevOps Agent

This directory contains the central dataset and idempotent seeders for establishing a repeatable 10-company demonstration of the Autonomous RevOps Agent.

---

## 1. The 10 Seed Scenarios

The shared dataset (`backend/seed/seedData.js`) defines 10 realistic B2B customer accounts with deliberate risk distributions:

| # | Risk Category | Company | Primary Contact | Deal Name & Value | Intended Scenario |
|---|---|---|---|---|---|
| 1 | **High** | Northwind Logistics | Marcus Vance | Route Optimization Stalled Deal ($48k) | 3 unanswered follow-ups, overdue close date, sharply declining product usage. |
| 2 | **High** | Helios Solar Systems | Elena Rostova | Solar Grid Monitoring Stalled Expansion ($35k) | Contract stalled in legal review redlines, delayed progress, past close date. |
| 3 | **High** | Pinecrest Education | Dr. Arthur Pendelton | Student Analytics Stalled Pilot ($26k) | Dormant pilot with zero faculty logins in last 2 weeks, overdue close date. |
| 4 | **Medium** | Cascade Retail Group | Sarah Jenkins | Store Inventory Stalled Evaluation ($18.5k) | Unanswered volume tier discount question, steady moderate usage. |
| 5 | **Medium** | Lumina Media | David Cho | Transcoding Pipeline Stalled Add-on ($15k) | Sluggish creative adoption, slow email replies, future close date. |
| 6 | **Medium** | Meridian Insurance Brokers | Rebecca Sterling | Underwriting Automation Stalled Renewal ($19.5k) | Deal awaiting Q4 executive budget committee sign-off, future close date. |
| 7 | **Low** | Orbit Fintech | Liam Gallagher | High-Throughput Gateway Expansion ($52k) | Surging product API volume, fast email turnaround, security audit approved. |
| 8 | **Low** | Vitalis Clinics | Dr. Chloe Bennett | Telehealth Patient Portal Deployment ($28k) | High clinician adoption (94% satisfaction), steady daily sessions. |
| 9 | **Low** | Terra Agritech | Carlos Mendez | Telemetry Pipeline Integration ($14k) | Consistent soil sensor telemetry streaming, contract signing on schedule. |
| 10 | **Low / Unknown** | Atlas Construction Tech | Brett Morales | Safety Scanner Initial Evaluation ($12k) | Minimal signals (zero product events, no emails) testing graceful insufficient-data handling. |

### Scoring Engine Alignment
The RevOps scoring engine evaluates:
- **`stalled`** in deal name or stage: `+35`
- **Overdue close date** (excluding closed-won): `+30`
- **Deal amount >= $20,000**: `+10`

Resulting CRM risk scores:
- High Risk (&ge; 50): Northwind (75), Helios (75), Pinecrest (75)
- Medium Risk (25–49): Cascade (35), Lumina (35), Meridian (35)
- Low Risk (&lt; 25): Orbit (10), Vitalis (10), Terra (0), Atlas (0)

---

## 2. Architecture & Credential Distinction

1. **HubSpot Seeder (`seed-hubspot-data.js`):**
   - Direct CRM seeding uses `HUBSPOT_ACCESS_TOKEN` (Private App Token) to create or update companies, contacts, and deals.
   - If `HUBSPOT_ACCESS_TOKEN` is omitted, it operates in offline simulation mode, generating deterministic ID mappings in `backend/seed/seed-ids.json` so you can demo and test without needing HubSpot admin rights.
2. **PostHog Seeder (`seed-posthog-data.js`):**
   - Ingestion uses `POSTHOG_API_KEY` (Project API Key) to batch event telemetry with `properties.company_id` set to the exact HubSpot Company ID.
   - Query verification uses `POSTHOG_PERSONAL_API_KEY` to run HogQL queries.
3. **Demo Email & Calendar Signals (`src/data/mockRevOpsData.js`):**
   - Active when `REVOPS_DEMO_MODE=true`. Merges synthetic messages and calendar appointments matching the exact names, domains, and contacts of the 10 seed companies.
4. **Execution Safeguards:**
   - `DRY_RUN=true` prevents external live actions from modifying customer systems.
   - `TEST_RECIPIENT_EMAIL` or `GMAIL_ALLOWED_RECIPIENTS` restricts all outgoing emails on the server side to your verified email address.

---

## 3. Safe, Repeatable Demo Command Sequence

### Step 1: Install Dependencies
```powershell
# Windows PowerShell
cd c:\Users\radsp\Desktop\RevOps-Agent\backend
npm install
```
```bash
# Unix / macOS
cd backend && npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and verify credentials:
```powershell
cp .env.example .env
```
Ensure safety defaults are set:
```env
REVOPS_DEMO_MODE=true
DRY_RUN=true
TEST_RECIPIENT_EMAIL=your_email@gmail.com
```

### Step 3: Run HubSpot Seeder
```powershell
npm run seed:hubspot
```
- Creates/updates records in HubSpot or generates deterministic `seed-ids.json`.
- Associates deals and contacts to each company.

### Step 4: Run PostHog Seeder
```powershell
npm run seed:posthog
```
- Ingests activity events tagged with `properties.company_id` from `seed-ids.json`.
- Verifies queryability via HogQL.

### Step 5: Start the Backend & Frontend
Terminal 1 (Backend):
```powershell
npm start
```
Terminal 2 (Frontend):
```powershell
cd ..\frontend
npm run dev
```

### Step 6: Trigger Revenue Analysis
Navigate to `http://localhost:3000/intelligence/deal-1` or call the analysis API:
```powershell
curl http://localhost:5000/api/analysis
```

### Step 7: Review & Approve Recommended Actions
1. Navigate to **AI Intelligence** &rarr; **Recommendations**.
2. Click **View Recommended Actions** to open the **Approval Center** (`/approvals`).
3. Locate the follow-up email draft (e.g. for Northwind Logistics or Acme).
4. Click **Approve & Send Mail** to inspect the real recipient and AI draft.
5. Confirm approval. The system safely sends the live email to `TEST_RECIPIENT_EMAIL` (or simulates in dry-run mode) and marks the action `EXECUTED`.

---

## 4. Safe Cleanup Instructions

To remove records created by this seeder without touching unrelated customer data:
```powershell
npm run seed:clean
```
**Safety Guarantee:** The cleanup script only deletes records whose IDs are explicitly registered in `backend/seed/seed-ids.json`. It will never delete unassociated customer records.
