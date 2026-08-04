import apiClient from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Alternative = {
  option: string;
  prosAndCons?: { pros: string[]; cons: string[] };
  whyNotChosen?: string;
};

export type ExpectedOutcome = {
  outcome: string;
  metric?: string;
  targetValue?: number;
  timeframe?: string;
  importance?: number;
};

export type Decision = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  status: string;
  decisionDate: string;
  expectedOutcomeDate?: string;
  context?: string;
  reasoningProcess?: string;
  alternativesConsidered?: Alternative[];
  expectedOutcomes?: ExpectedOutcome[];
  confidenceLevel: number;
  frameworkUsed?: string;
  tags?: string[];
  isPrivate: boolean;
  parentDecisionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type DecisionCreatePayload = {
  title: string;
  category?: string;
  description?: string;
  context?: string;
  reasoningProcess?: string;
  alternativesConsidered?: Alternative[];
  expectedOutcomes?: ExpectedOutcome[];
  confidenceLevel?: number;
  expectedOutcomeDate?: string;
  tags?: string[];
  isPrivate?: boolean;
};

export type Outcome = {
  id: string;
  decisionId: string;
  checkInDate?: string;
  satisfactionScore: number;
  wouldDecideAgain?: boolean;
  actualResults: string;
  reflections?: string;
  lessonsLearned?: string;
  moodAtCheckIn?: number;
  stressLevel?: number;
  createdAt: string;
  updatedAt: string;
};

export type PendingCheckin = {
  id: string;
  decisionId: string;
  userId: string;
  reminderType: string;
  scheduledDate: string;
  status: string;
  customMessage?: string;
  createdAt: string;
  decision?: { title: string; category: string };
};

export type Template = {
  id: string;
  name: string;
  description?: string;
  category: string;
  template: {
    titlePrompt?: string;
    descriptionPrompt?: string;
    contextQuestions?: string[];
    expectedOutcomePrompts?: string[];
    suggestedTags?: string[];
  };
  isSystemTemplate: boolean;
};

// ─── API Functions ────────────────────────────────────────────────────────────

export const decisionsApi = {
  getDecisions: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const { data } = await apiClient.get<{
      data: Decision[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/decisions', { params });
    return data;
  },

  getDecision: async (id: string): Promise<Decision> => {
    const { data } = await apiClient.get<{ data: Decision }>(`/decisions/${id}`);
    return data.data;
  },

  createDecision: async (payload: DecisionCreatePayload): Promise<Decision> => {
    const { data } = await apiClient.post<{ data: Decision }>('/decisions', payload);
    return data.data;
  },

  updateDecision: async (id: string, payload: Partial<DecisionCreatePayload>): Promise<Decision> => {
    const { data } = await apiClient.patch<{ data: Decision }>(`/decisions/${id}`, payload);
    return data.data;
  },

  deleteDecision: async (id: string): Promise<void> => {
    await apiClient.delete(`/decisions/${id}`);
  },

  getOutcomes: async (decisionId: string): Promise<Outcome[]> => {
    const { data } = await apiClient.get<{ data: Outcome[] }>('/outcomes', {
      params: { decision_id: decisionId },
    });
    return data.data;
  },

  createOutcome: async (payload: {
    decisionId: string;
    satisfactionScore: number;
    actualResults: string;
    reflections?: string;
    lessonsLearned?: string;
    wouldDecideAgain?: boolean;
    moodAtCheckIn?: number;
    stressLevel?: number;
  }): Promise<Outcome> => {
    const { data } = await apiClient.post<{ data: Outcome }>('/outcomes', payload);
    return data.data;
  },

  getPendingCheckins: async (): Promise<PendingCheckin[]> => {
    const { data } = await apiClient.get<{ data: PendingCheckin[] }>('/outcomes/pending-checkins');
    return data.data;
  },

  skipCheckin: async (id: string): Promise<void> => {
    await apiClient.post(`/outcomes/checkins/${id}/skip`);
  },

  getTemplates: async (): Promise<Template[]> => {
    const { data } = await apiClient.get<{ data: Template[] }>('/templates');
    return data.data;
  },
};
