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
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async () => {
    const { data } = await apiClient.get<{ user: { id: string; firstName: string; lastName: string; email: string; status: string } }>('/users/me');
    return data.user;
  },
};
