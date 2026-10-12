import axios, { AxiosError } from "axios";
import type {
  AnalysisResponse,
  ActionsResponse,
  ActionMutationResponse,
  GoogleStatusResponse,
  HealthResponse,
  ActionStatus,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected API error occurred.";
    const status = error.response?.status || 500;
    return Promise.reject(new ApiError(message, status, error.response?.data));
  }
);

export const api = {
  getHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>("/health");
    return res.data;
  },

  getAnalysis: async (limit: number = 10): Promise<AnalysisResponse> => {
    const res = await apiClient.get<AnalysisResponse>(`/analysis?limit=${limit}`);
    return res.data;
  },

  getActions: async (status?: ActionStatus, limit: number = 50): Promise<ActionsResponse> => {
    const query = status ? `?status=${status}&limit=${limit}` : `?limit=${limit}`;
    const res = await apiClient.get<ActionsResponse>(`/actions${query}`);
    return res.data;
  },

  approveAction: async (id: string, actor: string = "Parthika Mahajan (Reviewer)", note?: string): Promise<ActionMutationResponse> => {
    const res = await apiClient.post<ActionMutationResponse>(`/actions/${id}/approve`, {
      actor,
      note,
    });
    return res.data;
  },

  rejectAction: async (id: string, actor: string = "Parthika Mahajan (Reviewer)", note?: string): Promise<ActionMutationResponse> => {
    const res = await apiClient.post<ActionMutationResponse>(`/actions/${id}/reject`, {
      actor,
      note,
    });
    return res.data;
  },

  executeAction: async (id: string, actor: string = "Parthika Mahajan (Reviewer)"): Promise<ActionMutationResponse> => {
    const res = await apiClient.post<ActionMutationResponse>(`/actions/${id}/execute`, {
      actor,
    });
    return res.data;
  },

  getHubSpotDeals: async (limit: number = 10) => {
    const res = await apiClient.get(`/hubspot/deals?limit=${limit}`);
    return res.data;
  },

  getHubSpotCompanies: async (limit: number = 10) => {
    const res = await apiClient.get(`/hubspot/companies?limit=${limit}`);
    return res.data;
  },

  getGoogleStatus: async (): Promise<GoogleStatusResponse> => {
    const res = await apiClient.get<GoogleStatusResponse>("/google/status");
    return res.data;
  },

  getGoogleAuthUrl: async (): Promise<{ success: boolean; authUrl: string }> => {
    const res = await apiClient.get("/google/auth");
    return res.data;
  },

  sendFollowUpEmail: async (data: {
    dealId?: string;
    accountName?: string;
    subject: string;
    body: string;
    to?: string;
    actor?: string;
  }): Promise<ActionMutationResponse> => {
    const res = await apiClient.post<ActionMutationResponse>("/actions/send-email", data);
    return res.data;
  },
};
