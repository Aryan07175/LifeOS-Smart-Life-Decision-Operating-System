import apiClient from './client';

export type PreDecisionAnalysis = {
  verdict: 'proceed' | 'caution' | 'reconsider';
  confidenceInVerdict: number;
  riskFactors: string[];
  supportingEvidence: string[];
  suggestions: string[];
  blindSpots: string[];
  timingAssessment: string;
  historicalContext: string;
};

export type SSEEvent =
  | { type: 'session'; sessionId: string }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export const aiApi = {
  preDecisionAnalysis: async (payload: {
    title: string;
    category: string;
    description?: string;
    context?: string;
    confidenceLevel?: number;
    expectedOutcomes?: Array<{ outcome: string; metric?: string; targetValue?: number }>;
    alternativesConsidered?: Array<{ option: string }>;
  }): Promise<PreDecisionAnalysis> => {
    const { data } = await apiClient.post<{ data: PreDecisionAnalysis }>(
      '/ai/pre-decision-analysis',
      payload,
    );
    return data.data;
  },

  sendChatMessage: async (
    payload: { sessionId?: string; message: string; decisionId?: string },
    onEvent: (event: SSEEvent) => void,
    onError: (err: Error) => void,
    onDone: () => void,
  ): Promise<void> => {
    const token = localStorage.getItem('lifeos_access_token');
    const response = await fetch(
      'https://r2z3a7sivkzpowumc5ogz4ypsa0nvinu.lambda-url.ap-south-1.on.aws/api/v1/ai/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok || !response.body) {
      onError(new Error(`HTTP ${response.status}`));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (!raw || raw === '[DONE]') continue;
            try {
              const event = JSON.parse(raw) as SSEEvent;
              onEvent(event);
            } catch {
              // skip malformed
            }
          }
        }
      }
    } catch (err) {
      onError(err as Error);
    } finally {
      onDone();
    }
  },

  getSessions: async () => {
    const { data } = await apiClient.get<{ data: Array<{ id: string; title?: string; createdAt: string; updatedAt: string }> }>('/ai/sessions');
    return data.data;
  },

  getSession: async (sessionId: string) => {
    const { data } = await apiClient.get<{ data: { id: string; messages: Array<{ id: string; role: string; content: string; createdAt: string }> } }>(`/ai/sessions/${sessionId}`);
    return data.data;
  },
};
