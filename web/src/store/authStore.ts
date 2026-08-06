import { create } from 'zustand';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type AuthState = {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;
  setTokens: (accessToken: string, refreshToken: string, user?: User) => void;
  clearTokens: () => void;
  hydrate: () => void;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,

  hydrate: () => {
    try {
      const token = localStorage.getItem('lifeos_access_token');
      const userStr = localStorage.getItem('lifeos_user');
      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch {
          // Corrupt user data — clear it and proceed as logged-out
          localStorage.removeItem('lifeos_user');
        }
      }
      set({ accessToken: token, user, isHydrated: true });
    } catch {
      // localStorage unavailable (e.g. Private Browsing) — treat as logged-out
      set({ accessToken: null, user: null, isHydrated: true });
    }
  },

  setTokens: (accessToken, refreshToken, user) => {
    localStorage.setItem('lifeos_access_token', accessToken);
    localStorage.setItem('lifeos_refresh_token', refreshToken);
    if (user) localStorage.setItem('lifeos_user', JSON.stringify(user));
    set({ accessToken, user: user ?? null });
  },

  clearTokens: () => {
    localStorage.removeItem('lifeos_access_token');
    localStorage.removeItem('lifeos_refresh_token');
    localStorage.removeItem('lifeos_user');
    set({ accessToken: null, user: null });
  },

  setUser: (user) => {
    localStorage.setItem('lifeos_user', JSON.stringify(user));
    set({ user });
  },
}));
