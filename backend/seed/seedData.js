// backend/seed/seedData.js
/**
 * Shared Seed Dataset for Autonomous RevOps Agent
 * Contains 10 realistic companies representing:
 * - 3 High Risk (Northwind Logistics, Helios Solar Systems, Pinecrest Education)
 * - 3 Medium Risk (Cascade Retail Group, Lumina Media, Meridian Insurance Brokers)
 * - 3 Low Risk (Orbit Fintech, Vitalis Clinics, Terra Agritech)
 * - 1 Low / Insufficient Data (Atlas Construction Tech)
 *
 * All dates are generated dynamically relative to execution time.
 */

export function generateSeedData(now = new Date()) {
  const nowMs = now.getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const daysAgo = (days) => new Date(nowMs - days * DAY_MS).toISOString();
  const daysAhead = (days) => new Date(nowMs + days * DAY_MS).toISOString();

  return [
    // =========================================================================
    // 1. HIGH RISK - Northwind Logistics
    // Intended: Three unanswered follow-ups and sharply declining product usage
    // Scoring: "stalled" in dealName (+35), past closeDate (+30), amount >= 20k (+10) = 75 (High)
    // =========================================================================
    {
      key: "northwind-logistics",
      seedId: "revops-seed-001",
      riskCategory: "High",
      intendedScenario: "Three unanswered follow-ups and sharply declining product usage",
      expectedScore: 75,
      company: {
        name: "Northwind Logistics",
        domain: "northwindlogistics.com",
        website: "https://www.northwindlogistics.com",
        industry: "Logistics & Supply Chain",
        description: "Third-party freight and cold-chain supply operations across North America.",
        city: "Chicago",
        state: "IL",
      },
      contact: {
        firstName: "Marcus",
        lastName: "Vance",
        email: "marcus.vance@northwindlogistics.com",
        phone: "+1-312-555-0144",
        jobTitle: "VP of Fleet Operations",
      },
      deal: {
        dealName: "Northwind - Route Optimization Stalled Deal",
        amount: 48000,
        dealstage: "appointmentscheduled",
        closedate: daysAgo(14), // overdue by 14 days (+30)
        pipeline: "default",
      },
      productUsage: {
        pattern: "sharply_declining",
        description: "Heavy usage 30-15 days ago, dropped to near-zero active users in last 14 days",
        events: [
          { event: "dashboard_view", countPrior: 12, countRecent: 1 },
          { event: "route_calculated", countPrior: 15, countRecent: 0 },
          { event: "driver_manifest_exported", countPrior: 6, countRecent: 0 },
          { event: "telemetry_ping", countPrior: 15, countRecent: 1 },
        ],
      },
      emails: [
        {
          id: "seed-email-northwind-1",
          subject: "Checking in on the Route Optimization contract for Northwind Logistics",
          from: "sales@revops-agent.internal",
          to: "marcus.vance@northwindlogistics.com",
          date: daysAgo(12),
          snippet: "Hi Marcus, following up on our proposal. We haven't heard back since our pricing sync. Could you confirm if your team is still reviewing the rollout schedule?",
          demo: true,
        },
        {
          id: "seed-email-northwind-2",
          subject: "Second follow-up: Route optimization proposal & implementation timeline",
          from: "sales@revops-agent.internal",
          to: "marcus.vance@northwindlogistics.com",
          date: daysAgo(7),
          snippet: "Hi Marcus, wanted to touch base again. We noticed your pilot dispatch team has been less active on the portal this week. Are there any blockers we can help resolve?",
          demo: true,
        },
        {
          id: "seed-email-northwind-3",
          subject: "Urgent: Next steps before Northwind proposal expiration",
          from: "sales@revops-agent.internal",
          to: "marcus.vance@northwindlogistics.com",
          date: daysAgo(2),
          snippet: "Marcus, our Q3 discount terms expire this Friday. This is our third follow-up with no response. Do you have 10 minutes for a brief call to align on priorities?",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-northwind-1",
          summary: "Northwind Logistics Pilot Progress Review (Missed)",
          description: "Follow-up meeting to review route optimization pilot metrics. Customer did not attend; reschedule pending.",
          start: daysAgo(5),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 2. HIGH RISK - Helios Solar Systems
    // Intended: Deal stalled in legal review with delayed progress
    // Scoring: "stalled" in dealName (+35), past closeDate (+30), amount >= 20k (+10) = 75 (High)
    // =========================================================================
    {
      key: "helios-solar",
      seedId: "revops-seed-002",
      riskCategory: "High",
      intendedScenario: "Deal stalled in legal review with delayed progress",
      expectedScore: 75,
      company: {
        name: "Helios Solar Systems",
        domain: "heliossolarsystems.com",
        website: "https://www.heliossolarsystems.com",
        industry: "Renewable Energy",
        description: "Commercial and residential solar micro-grid installations.",
        city: "Austin",
        state: "TX",
      },
      contact: {
        firstName: "Elena",
        lastName: "Rostova",
        email: "elena.rostova@heliossolarsystems.com",
        phone: "+1-512-555-0182",
        jobTitle: "Director of Procurement & Legal",
      },
      deal: {
        dealName: "Helios - Solar Grid Monitoring Stalled Expansion",
        amount: 35000,
        dealstage: "contractsent",
        closedate: daysAgo(9), // overdue by 9 days (+30)
        pipeline: "default",
      },
      productUsage: {
        pattern: "declining_engagement",
        description: "Grid monitoring queries dropping due to legal standstill on telemetry add-on",
        events: [
          { event: "inverter_status_queried", countPrior: 20, countRecent: 2 },
          { event: "energy_report_generated", countPrior: 10, countRecent: 1 },
          { event: "compliance_audit_logged", countPrior: 8, countRecent: 0 },
        ],
      },
      emails: [
        {
          id: "seed-email-helios-1",
          subject: "Helios Solar MSA legal review & data privacy clause redlines",
          from: "sales@revops-agent.internal",
          to: "elena.rostova@heliossolarsystems.com",
          date: daysAgo(10),
          snippet: "Hi Elena, our legal counsel submitted revised indemnity redlines. Could you confirm if your legal department has approved clause 9.2?",
          demo: true,
        },
        {
          id: "seed-email-helios-2",
          subject: "Status of legal review for Helios Solar Systems expansion",
          from: "elena.rostova@heliossolarsystems.com",
          to: "sales@revops-agent.internal",
          date: daysAgo(6),
          snippet: "Apologies for the delay. Our outside legal counsel is tied up with our quarterly audit. Review is stalled until next month at the earliest.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-helios-1",
          summary: "Helios Solar Legal Alignment Call (Postponed)",
          description: "Review contract redlines and procurement terms with Elena Rostova. Postponed by customer legal team.",
          start: daysAgo(4),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 3. HIGH RISK - Pinecrest Education
    // Intended: Pilot became inactive, with declining adoption
    // Scoring: "stalled" in dealName (+35), past closeDate (+30), amount >= 20k (+10) = 75 (High)
    // =========================================================================
    {
      key: "pinecrest-education",
      seedId: "revops-seed-003",
      riskCategory: "High",
      intendedScenario: "Pilot became inactive, with declining adoption",
      expectedScore: 75,
      company: {
        name: "Pinecrest Education",
        domain: "pinecresteducation.org",
        website: "https://www.pinecresteducation.org",
        industry: "Higher Education",
        description: "Multi-campus college network serving 25,000 enrolled students.",
        city: "Boston",
        state: "MA",
      },
      contact: {
        firstName: "Arthur",
        lastName: "Pendelton",
        email: "arthur.pendelton@pinecresteducation.org",
        phone: "+1-617-555-0129",
        jobTitle: "Dean of Academic Technology",
      },
      deal: {
        dealName: "Pinecrest - Student Analytics Stalled Pilot",
        amount: 26000,
        dealstage: "decisionmakerboughtin",
        closedate: daysAgo(6), // overdue by 6 days (+30)
        pipeline: "default",
      },
      productUsage: {
        pattern: "inactive_pilot",
        description: "Faculty logins peaked in month 1 and crashed to near zero in the last 20 days",
        events: [
          { event: "faculty_login", countPrior: 25, countRecent: 1 },
          { event: "gradebook_sync", countPrior: 15, countRecent: 0 },
          { event: "attendance_flagged", countPrior: 8, countRecent: 0 },
        ],
      },
      emails: [
        {
          id: "seed-email-pinecrest-1",
          subject: "Pinecrest pilot utilization numbers and faculty onboarding",
          from: "sales@revops-agent.internal",
          to: "arthur.pendelton@pinecresteducation.org",
          date: daysAgo(8),
          snippet: "Dr. Pendelton, we pulled the pilot telemetry for the arts and sciences department and noticed daily logins dropped below 5%. Let's discuss faculty training resources.",
          demo: true,
        },
        {
          id: "seed-email-pinecrest-2",
          subject: "Re: Pinecrest pilot utilization numbers",
          from: "arthur.pendelton@pinecresteducation.org",
          to: "sales@revops-agent.internal",
          date: daysAgo(5),
          snippet: "Faculty complained about SSO integration friction, so most departments reverted to their legacy spreadsheets. We cannot commit to a campus rollout at this stage.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-pinecrest-1",
          summary: "Pinecrest Campus Pilot Health Check",
          description: "Discuss adoption friction, faculty training, and student analytics pilot completion.",
          start: daysAgo(2),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 4. MEDIUM RISK - Cascade Retail Group
    // Intended: Unanswered pricing question and moderate engagement
    // Scoring: "stalled" in dealName (+35), future closeDate (0), amount < 20k (0) = 35 (Medium)
    // =========================================================================
    {
      key: "cascade-retail",
      seedId: "revops-seed-004",
      riskCategory: "Medium",
      intendedScenario: "Unanswered pricing question and moderate engagement",
      expectedScore: 35,
      company: {
        name: "Cascade Retail Group",
        domain: "cascaderetailgroup.com",
        website: "https://www.cascaderetailgroup.com",
        industry: "Retail & E-Commerce",
        description: "Regional supermarket chain operating 80 physical retail branches.",
        city: "Seattle",
        state: "WA",
      },
      contact: {
        firstName: "Sarah",
        lastName: "Jenkins",
        email: "sarah.jenkins@cascaderetailgroup.com",
        phone: "+1-206-555-0167",
        jobTitle: "Senior Director of Merchandising",
      },
      deal: {
        dealName: "Cascade - Store Inventory Stalled Evaluation",
        amount: 18500, // < 20k
        dealstage: "presentationscheduled",
        closedate: daysAhead(21), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "moderate_active",
        description: "Steady usage across 12 branch test stores, consistent event traffic",
        events: [
          { event: "sku_lookup", countPrior: 15, countRecent: 15 },
          { event: "stockout_alert_triggered", countPrior: 8, countRecent: 7 },
          { event: "weekly_reorder_computed", countPrior: 4, countRecent: 4 },
        ],
      },
      emails: [
        {
          id: "seed-email-cascade-1",
          subject: "Tiered pricing question for Cascade Retail store expansion",
          from: "sarah.jenkins@cascaderetailgroup.com",
          to: "sales@revops-agent.internal",
          date: daysAgo(4),
          snippet: "Hi team, we reviewed your proposal for the first 20 stores. If we expand to all 80 stores by Q4, what volume tier pricing discount can you provide? Awaiting your numbers.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-cascade-1",
          summary: "Cascade Retail Group Pricing & Volume Tier Sync",
          description: "Review multi-store tier discount structure with Sarah Jenkins and procurement.",
          start: daysAhead(5),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 5. MEDIUM RISK - Lumina Media
    // Intended: Weak engagement and a potential expansion opportunity
    // Scoring: "stalled" in dealName (+35), future closeDate (0), amount < 20k (0) = 35 (Medium)
    // =========================================================================
    {
      key: "lumina-media",
      seedId: "revops-seed-005",
      riskCategory: "Medium",
      intendedScenario: "Weak engagement and a potential expansion opportunity",
      expectedScore: 35,
      company: {
        name: "Lumina Media",
        domain: "luminamedia.tv",
        website: "https://www.luminamedia.tv",
        industry: "Entertainment & Streaming",
        description: "Digital streaming content network and independent production studio.",
        city: "Los Angeles",
        state: "CA",
      },
      contact: {
        firstName: "David",
        lastName: "Cho",
        email: "david.cho@luminamedia.tv",
        phone: "+1-310-555-0193",
        jobTitle: "Head of Post-Production",
      },
      deal: {
        dealName: "Lumina - Transcoding Pipeline Stalled Add-on",
        amount: 15000, // < 20k
        dealstage: "qualifiedtobuy",
        closedate: daysAhead(30), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "low_sporadic",
        description: "Occasional encoding batch submitted, but creative team adoption remains sluggish",
        events: [
          { event: "asset_rendered", countPrior: 10, countRecent: 8 },
          { event: "cloud_transcode_job", countPrior: 5, countRecent: 4 },
        ],
      },
      emails: [
        {
          id: "seed-email-lumina-1",
          subject: "Exploring Lumina Media 4K post-production add-on",
          from: "sales@revops-agent.internal",
          to: "david.cho@luminamedia.tv",
          date: daysAgo(6),
          snippet: "David, following up on our demonstration of the accelerated 4K rendering module. We see strong potential to cut your export cycle times by 60%.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-lumina-1",
          summary: "Lumina Media Creative Workflow Review",
          description: "Demo 4K accelerated transcoding for David Cho and senior editors.",
          start: daysAhead(8),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 6. MEDIUM RISK - Meridian Insurance Brokers
    // Intended: Deal awaiting budget approval
    // Scoring: "stalled" in dealName (+35), future closeDate (0), amount < 20k (0) = 35 (Medium)
    // =========================================================================
    {
      key: "meridian-insurance",
      seedId: "revops-seed-006",
      riskCategory: "Medium",
      intendedScenario: "Deal awaiting budget approval",
      expectedScore: 35,
      company: {
        name: "Meridian Insurance Brokers",
        domain: "meridianbrokers.com",
        website: "https://www.meridianbrokers.com",
        industry: "Financial Services & Insurance",
        description: "Commercial insurance brokerage with 1,200 independent brokers.",
        city: "Atlanta",
        state: "GA",
      },
      contact: {
        firstName: "Rebecca",
        lastName: "Sterling",
        email: "rebecca.sterling@meridianbrokers.com",
        phone: "+1-404-555-0118",
        jobTitle: "Chief Underwriting Officer",
      },
      deal: {
        dealName: "Meridian - Underwriting Automation Stalled Renewal",
        amount: 19500, // < 20k
        dealstage: "contractsent",
        closedate: daysAhead(14), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "stable_moderate",
        description: "Underwriters use core policy lookup daily; premium recalculation feature waiting for contract",
        events: [
          { event: "policy_quote_lookup", countPrior: 18, countRecent: 18 },
          { event: "underwriting_score_pulled", countPrior: 10, countRecent: 10 },
        ],
      },
      emails: [
        {
          id: "seed-email-meridian-1",
          subject: "Meridian renewal contract and FY27 budget timeline",
          from: "rebecca.sterling@meridianbrokers.com",
          to: "sales@revops-agent.internal",
          date: daysAgo(3),
          snippet: "Our executive committee reviewed the automation renewal. We are fully in favor, but all capital expenditures over $15k are on hold pending the Q4 budget committee meeting next Thursday.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-meridian-1",
          summary: "Meridian Insurance Budget Approval Check-in",
          description: "Follow-up call with Rebecca Sterling after executive budget committee meeting.",
          start: daysAhead(9),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 7. LOW RISK - Orbit Fintech
    // Intended: Healthy engagement and active customer communication
    // Scoring: no "stalled" (0), future closeDate (0), amount >= 20k (+10) = 10 (Low)
    // =========================================================================
    {
      key: "orbit-fintech",
      seedId: "revops-seed-007",
      riskCategory: "Low",
      intendedScenario: "Healthy engagement and active customer communication",
      expectedScore: 10,
      company: {
        name: "Orbit Fintech",
        domain: "orbitfintech.io",
        website: "https://www.orbitfintech.io",
        industry: "Financial Technology",
        description: "Real-time payment rails and B2B merchant clearing API.",
        city: "San Francisco",
        state: "CA",
      },
      contact: {
        firstName: "Liam",
        lastName: "Gallagher",
        email: "liam.gallagher@orbitfintech.io",
        phone: "+1-415-555-0177",
        jobTitle: "Head of Infrastructure",
      },
      deal: {
        dealName: "Orbit - High-Throughput Gateway Expansion",
        amount: 52000, // >= 20k (+10)
        dealstage: "presentationscheduled",
        closedate: daysAhead(45), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "accelerating_high",
        description: "Surging API volumes, high daily active developer sessions",
        events: [
          { event: "payment_webhook_dispatched", countPrior: 20, countRecent: 40 },
          { event: "api_key_generated", countPrior: 4, countRecent: 8 },
          { event: "settlement_batch_cleared", countPrior: 8, countRecent: 16 },
        ],
      },
      emails: [
        {
          id: "seed-email-orbit-1",
          subject: "Orbit Fintech security audit completed successfully",
          from: "liam.gallagher@orbitfintech.io",
          to: "sales@revops-agent.internal",
          date: daysAgo(2),
          snippet: "Hi team, our Infosec team signed off on the SOC2 Type II compliance package with zero exceptions. We are excited to finalize the multi-region expansion proposal.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-orbit-1",
          summary: "Orbit Fintech Multi-Region Architecture Review",
          description: "Technical deep-dive on EU region deployment and latency targets with Liam Gallagher.",
          start: daysAhead(3),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 8. LOW RISK - Vitalis Clinics
    // Intended: Stable product adoption and positive account signals
    // Scoring: no "stalled" (0), future closeDate (0), amount >= 20k (+10) = 10 (Low)
    // =========================================================================
    {
      key: "vitalis-clinics",
      seedId: "revops-seed-008",
      riskCategory: "Low",
      intendedScenario: "Stable product adoption and positive account signals",
      expectedScore: 10,
      company: {
        name: "Vitalis Clinics",
        domain: "vitalisclinics.health",
        website: "https://www.vitalisclinics.health",
        industry: "Healthcare & Telehealth",
        description: "Specialized outpatient clinics and virtual care network.",
        city: "Denver",
        state: "CO",
      },
      contact: {
        firstName: "Chloe",
        lastName: "Bennett",
        email: "chloe.bennett@vitalisclinics.health",
        phone: "+1-303-555-0155",
        jobTitle: "Chief Medical Information Officer",
      },
      deal: {
        dealName: "Vitalis - Telehealth Patient Portal Deployment",
        amount: 28000, // >= 20k (+10)
        dealstage: "decisionmakerboughtin",
        closedate: daysAhead(60), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "stable_growing",
        description: "High patient intake volumes and consistent daily clinician sessions",
        events: [
          { event: "patient_intake_completed", countPrior: 18, countRecent: 22 },
          { event: "telehealth_session_joined", countPrior: 12, countRecent: 15 },
          { event: "ehr_chart_updated", countPrior: 20, countRecent: 24 },
        ],
      },
      emails: [
        {
          id: "seed-email-vitalis-1",
          subject: "Vitalis Clinics staff onboarding feedback",
          from: "chloe.bennett@vitalisclinics.health",
          to: "sales@revops-agent.internal",
          date: daysAgo(5),
          snippet: "The nursing staff completed their second training module. Clinical satisfaction is at 94%. We look forward to signing the expanded annual deployment agreement.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-vitalis-1",
          summary: "Vitalis Clinics Clinical Executive Briefing",
          description: "Present clinical engagement metrics and sign-off rollout schedule with Dr. Chloe Bennett.",
          start: daysAhead(10),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 9. LOW RISK - Terra Agritech
    // Intended: Consistent usage and a healthy deal
    // Scoring: no "stalled" (0), future closeDate (0), amount < 20k (0) = 0 (Low)
    // =========================================================================
    {
      key: "terra-agritech",
      seedId: "revops-seed-009",
      riskCategory: "Low",
      intendedScenario: "Consistent usage and a healthy deal",
      expectedScore: 0,
      company: {
        name: "Terra Agritech",
        domain: "terraagritech.com",
        website: "https://www.terraagritech.com",
        industry: "AgTech & Precision Farming",
        description: "IoT soil sensors and precision irrigation telemetry for commercial agriculture.",
        city: "Des Moines",
        state: "IA",
      },
      contact: {
        firstName: "Carlos",
        lastName: "Mendez",
        email: "carlos.mendez@terraagritech.com",
        phone: "+1-515-555-0133",
        jobTitle: "VP of Sensor Engineering",
      },
      deal: {
        dealName: "Terra - Telemetry Pipeline Integration",
        amount: 14000, // < 20k (0)
        dealstage: "contractsent",
        closedate: daysAhead(35), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "steady_telemetry",
        description: "Steady high-volume stream of agricultural sensor pings and automated irrigation triggers",
        events: [
          { event: "sensor_telemetry_packet", countPrior: 25, countRecent: 25 },
          { event: "irrigation_valve_toggled", countPrior: 8, countRecent: 8 },
        ],
      },
      emails: [
        {
          id: "seed-email-terra-1",
          subject: "Terra Agritech telemetry integration successfully validated",
          from: "carlos.mendez@terraagritech.com",
          to: "sales@revops-agent.internal",
          date: daysAgo(4),
          snippet: "Carlos here. All 4,000 field probe sensors have streamed telemetry without packet loss. We are very satisfied and ready to finalize the agreement.",
          demo: true,
        },
      ],
      calendarEvents: [
        {
          id: "seed-event-terra-1",
          summary: "Terra Agritech Contract Signing & Q4 Roadmap",
          description: "Execute telemetry license and review soil analysis roadmap with Carlos Mendez.",
          start: daysAhead(4),
          demo: true,
        },
      ],
    },

    // =========================================================================
    // 10. LOW / UNKNOWN RISK - Atlas Construction Tech
    // Intended: Minimal or missing signals to test insufficient-data handling
    // Scoring: no "stalled" (0), future closeDate (0), amount < 20k (0) = 0 (Low / Insufficient Data)
    // =========================================================================
    {
      key: "atlas-construction",
      seedId: "revops-seed-010",
      riskCategory: "Low / unknown",
      intendedScenario: "Minimal or missing signals to test insufficient-data handling",
      expectedScore: 0,
      company: {
        name: "Atlas Construction Tech",
        domain: "atlasconstructiontech.com",
        website: "https://www.atlasconstructiontech.com",
        industry: "Construction & Heavy Equipment",
        description: "Digital jobsite inspection and worker compliance wearables.",
        city: "Dallas",
        state: "TX",
      },
      contact: {
        firstName: "Brett",
        lastName: "Morales",
        email: "brett.morales@atlasconstructiontech.com",
        phone: "+1-214-555-0188",
        jobTitle: "Director of Jobsite Safety",
      },
      deal: {
        dealName: "Atlas - Safety Scanner Initial Evaluation",
        amount: 12000, // < 20k (0)
        dealstage: "appointmentscheduled",
        closedate: daysAhead(90), // future (+0)
        pipeline: "default",
      },
      productUsage: {
        pattern: "insufficient_data",
        description: "Zero product events recorded; tests graceful handling when company has no product telemetry",
        events: [],
      },
      emails: [], // Intentionally empty to test no-email handling
      calendarEvents: [], // Intentionally empty to test no-meeting handling
    },
  ];
}

export default generateSeedData();
