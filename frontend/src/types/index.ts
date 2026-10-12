export type RiskLevel = "high" | "medium" | "low";

export type ActionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTING"
  | "EXECUTED"
  | "FAILED";

export type ActionType =
  | "NOTIFY_OWNER"
  | "DRAFT_EMAIL"
  | "CREATE_TASK"
  | "UPDATE_CRM";

export interface DataCoverage {
  companyMatched: boolean;
  associatedContacts: number;
  emailsAvailable: boolean;
  matchingEmails: number;
  calendarAvailable: boolean;
  matchingEvents: number;
}

export interface MatchedEmail {
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  demo: boolean;
}

export interface MatchedEvent {
  summary: string;
  start: string | null;
  description: string;
  demo: boolean;
}

export interface AIInsights {
  riskExplanation?: string;
  keyFindings?: string[];
  nextBestAction?: string;
  summary?: string;
}

export interface DealAnalysis {
  dealId: string | null;
  dealName: string;
  company: string | null;
  stage: string;
  amount: number;
  closeDate: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
  evidence: string[];
  recommendations: string[];
  dataCoverage: DataCoverage;
  matchedEmails: MatchedEmail[];
  matchedEvents: MatchedEvent[];
  aiInsights: AIInsights | null;
  aiStatus: "success" | "failed" | "none";
  aiError: string | null;
  associationErrors?: string[];
}

export interface AnalysisSummary {
  companies: number;
  contacts: number;
  deals: number;
  emailsRetrieved: number;
  calendarEventsRetrieved: number;
  demoEmails: number;
  demoCalendarEvents: number;
  highRiskDeals: number;
  mediumRiskDeals: number;
  lowRiskDeals: number;
}

export interface IntegrationStatus {
  hubspot: boolean;
  gmail: boolean;
  calendar: boolean;
}

export interface AnalysisResponse {
  success: boolean;
  generatedAt: string;
  mode: "demo" | "live";
  dataSources: {
    hubspot: string;
    gmail: string;
    calendar: string;
  };
  summary: AnalysisSummary;
  integrations: IntegrationStatus;
  integrationErrors: {
    gmail: string | null;
    calendar: string | null;
  };
  deals: DealAnalysis[];
  ai?: {
    provider: string;
    model: string;
    configured: boolean;
    successfulDeals: number;
    failedDeals: number;
  };
  persistence?: {
    analysisRunId: string;
    proposedActionsCreated: number;
    proposedActions: Array<{
      id: string;
      accountName: string;
      type: ActionType;
      status: ActionStatus;
    }>;
  };
}

export interface ProposedAction {
  id: string;
  accountName: string;
  type: ActionType;
  payload: Record<string, any>;
  rationale: string;
  evidenceIds: string[];
  status: ActionStatus;
  approver: string | null;
  approvalNote: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  executedAt: string | null;
  externalId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  analysisRunId: string | null;
}

export interface ActionsResponse {
  success: boolean;
  count: number;
  actions: ProposedAction[];
}

export interface ActionMutationResponse {
  success: boolean;
  action: ProposedAction;
  dryRun?: boolean;
  message?: string;
  execution?: {
    dryRun?: boolean;
    message?: string;
  };
}

export interface GoogleStatusResponse {
  success: boolean;
  connected: boolean;
  email?: string | null;
  message?: string;
}

export interface HealthResponse {
  success: boolean;
  service: string;
  status: string;
}
