import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import { useAuthStore } from '@/store/authStore';
import { AppShell } from '@/components/layout/AppShell';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import DecisionsPage from '@/pages/DecisionsPage';
import DecisionDetailPage from '@/pages/DecisionDetailPage';
import NewDecisionPage from '@/pages/NewDecisionPage';
import CheckInPage from '@/pages/CheckInPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AIAdvisorPage from '@/pages/AIAdvisorPage';
import ProfilePage from '@/pages/ProfilePage';

// ── React Query Client ────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Protected Route Wrapper ───────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <span className="text-white text-lg">✨</span>
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading LifeOS...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ── Auth Route (redirect if already logged in) ────────────────────────────────
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isHydrated } = useAuthStore();

  if (!isHydrated) return null;
  if (accessToken) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// ── App Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public auth routes */}
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

        {/* Protected routes inside AppShell */}
        <Route path="/" element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
        <Route path="/decisions" element={<ProtectedRoute><AppShell><DecisionsPage /></AppShell></ProtectedRoute>} />
        <Route path="/decisions/new" element={<ProtectedRoute><AppShell><NewDecisionPage /></AppShell></ProtectedRoute>} />
        <Route path="/decisions/:id" element={<ProtectedRoute><AppShell><DecisionDetailPage /></AppShell></ProtectedRoute>} />
        <Route path="/decisions/:id/checkin" element={<ProtectedRoute><AppShell><CheckInPage /></AppShell></ProtectedRoute>} />
        <Route path="/checkins" element={<ProtectedRoute><AppShell><DecisionsPage /></AppShell></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppShell><AnalyticsPage /></AppShell></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AppShell><AIAdvisorPage /></AppShell></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function AppInit() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <AppRoutes />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
