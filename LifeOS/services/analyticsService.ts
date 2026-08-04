import apiClient from "@/utils/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalyticsSummary = {
  totalDecisions: number;
  averageConfidence: number | null;
  averageSatisfaction: number | null;
  pendingCheckins: number;
  totalOutcomes: number;
  topCategories: Array<{ category: string; count: number }>;
};

export type DecisionPattern = {
  id: string;
  patternType: string;
  category: string | null;
  pattern: {
    condition: string;
    outcome: string;
    frequency: number;
    confidence: number;
    sampleSize: number;
  };
  strength: string;
  discoveredAt: string;
};

export type QualityPoint = {
  month: string;
  avgSatisfaction: number;
  outcomeCount: number;
};

export type UserInsight = {
  id: string;
  insightType: string;
  title: string;
  description: string;
  supportingData: Record<string, any>;
  actionable: boolean;
  actionSuggestion?: string;
  category: string | null;
  significance: number;
  viewed: boolean;
  dismissed: boolean;
  dismissedAt: string | null;
  createdAt: string;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export const analyticsService = {
  /** GET /analytics/summary */
  getSummary: async (): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get<{ data: AnalyticsSummary }>("/analytics/summary");
    return data.data;
  },

  /** GET /analytics/patterns */
  getPatterns: async (): Promise<DecisionPattern[]> => {
    const { data } = await apiClient.get<{ data: DecisionPattern[] }>("/analytics/patterns");
    return data.data;
  },

  /** GET /analytics/decision-quality-over-time */
  getQualityOverTime: async (): Promise<QualityPoint[]> => {
    const { data } = await apiClient.get<{ data: { timeline: QualityPoint[] } }>(
      "/analytics/decision-quality-over-time",
    );
    return data.data.timeline;
  },

  /** GET /analytics/insights */
  getInsights: async (): Promise<UserInsight[]> => {
    const { data } = await apiClient.get<{ data: UserInsight[] }>("/analytics/insights");
    return data.data;
  },

  /** POST /analytics/insights/:id/dismiss */
  dismissInsight: async (id: string): Promise<void> => {
    await apiClient.post(`/analytics/insights/${id}/dismiss`);
  },
};
