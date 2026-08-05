import apiClient from './client';

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // Backend wraps response in { data: AuthResponse } envelope
    const { data } = await apiClient.post<{ data: AuthResponse } | AuthResponse>('/auth/login', payload);
    // Handle both { data: {...} } and flat response shapes
    return ('data' in data && 'accessToken' in (data as any).data)
      ? (data as any).data
      : data as AuthResponse;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ data: AuthResponse } | AuthResponse>('/auth/register', payload);
    return ('data' in data && 'accessToken' in (data as any).data)
      ? (data as any).data
      : data as AuthResponse;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async () => {
    const { data } = await apiClient.get<{ user: { id: string; firstName: string; lastName: string; email: string; status: string } }>('/users/me');
    return data.user;
  },
};
