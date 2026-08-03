import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const setStorageItemAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// ─── Keys ─────────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = "lifeos_access_token";
const REFRESH_TOKEN_KEY = "lifeos_refresh_token";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  hydrate: () => Promise<void>;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  /**
   * Persist tokens to SecureStore and update Zustand state.
   * Called after successful login or register.
   * AuthGuard in _layout.tsx reacts to accessToken change → redirects to /(tabs).
   */
  setTokens: async (accessToken, refreshToken) => {
    await setStorageItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await setStorageItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ accessToken, refreshToken });
  },

  /**
   * Clear tokens from SecureStore and Zustand state.
   * Called on logout.
   * AuthGuard reacts → redirects to /(auth)/login.
   */
  clearTokens: async () => {
    await deleteStorageItemAsync(ACCESS_TOKEN_KEY);
    await deleteStorageItemAsync(REFRESH_TOKEN_KEY);
    set({ accessToken: null, refreshToken: null });
  },

  /**
   * Rehydrate tokens from SecureStore on app start.
   * Call this once in app/_layout.tsx before rendering.
   */
  hydrate: async () => {
    const accessToken = await getStorageItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await getStorageItemAsync(REFRESH_TOKEN_KEY);
    set({ accessToken, refreshToken, isHydrated: true });
  },
}));
