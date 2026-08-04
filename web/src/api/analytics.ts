import apiClient from './client';

export type AnalyticsSummary = {
  totalDecisions: number;
  averageConfidence: number | null;
  averageSatisfaction: number | null;
  pendingCheckins: number;
  totalOutcomes: number;
  topCategories: Array<{ category: string; count: number; avgSatisfaction?: number }>;
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
  actionable: boolean;
  actionSuggestion?: string;
  category: string | null;
  significance: number;
  dismissed: boolean;
  createdAt: string;
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
};

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get<{ data: AnalyticsSummary }>('/analytics/summary');
    return data.data;
  },

  getQualityOverTime: async (): Promise<QualityPoint[]> => {
    const { data } = await apiClient.get<{ data: { timeline: QualityPoint[] } }>(
      '/analytics/decision-quality-over-time',
    );
    return data.data.timeline;
  },

  getInsights: async (): Promise<UserInsight[]> => {
    const { data } = await apiClient.get<{ data: UserInsight[] }>('/analytics/insights');
    return data.data;
  },

  dismissInsight: async (id: string): Promise<void> => {
    await apiClient.post(`/analytics/insights/${id}/dismiss`);
  },

  getPatterns: async (): Promise<DecisionPattern[]> => {
    const { data } = await apiClient.get<{ data: DecisionPattern[] }>('/analytics/patterns');
    return data.data;
  },
};
