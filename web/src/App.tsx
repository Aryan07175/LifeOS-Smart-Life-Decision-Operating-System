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
import CheckInsListPage from '@/pages/CheckInsListPage';
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

// ── Loading Splash ────────────────────────────────────────────────────────────
function LoadingSplash() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
          <span className="text-white text-lg">✨</span>
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading LifeOS...</p>
      </div>
    </div>
  );
}

// ── Protected Route Wrapper ───────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isHydrated } = useAuthStore();

  if (!isHydrated) return <LoadingSplash />;
  if (!accessToken) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

// ── Auth Route (redirect if already logged in) ────────────────────────────────
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isHydrated } = useAuthStore();

  if (!isHydrated) return <LoadingSplash />;
  if (accessToken) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// ── Animated Page Wrapper ─────────────────────────────────────────────────────
// Wraps AnimatePresence correctly — keyed by pathname so framer-motion
// can animate between page changes without destroying the Router context.
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* ── Public auth routes ── */}
        <Route path="/login"    element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

        {/* ── Protected routes ──
            IMPORTANT: specific paths MUST come before dynamic :id paths
            to prevent "new" or "checkin" being captured as :id param     */}
        <Route path="/"                         element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
        <Route path="/dashboard"                element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />

        {/* decisions — static paths first */}
        <Route path="/decisions"                element={<ProtectedRoute><AppShell><DecisionsPage /></AppShell></ProtectedRoute>} />
        <Route path="/decisions/new"            element={<ProtectedRoute><AppShell><NewDecisionPage /></AppShell></ProtectedRoute>} />
        {/* decisions — dynamic :id paths after */}
        <Route path="/decisions/:id"            element={<ProtectedRoute><AppShell><DecisionDetailPage /></AppShell></ProtectedRoute>} />
        <Route path="/decisions/:id/checkin"    element={<ProtectedRoute><AppShell><CheckInPage /></AppShell></ProtectedRoute>} />

        <Route path="/checkins"                 element={<ProtectedRoute><AppShell><CheckInsListPage /></AppShell></ProtectedRoute>} />
        <Route path="/outcomes"                 element={<ProtectedRoute><Navigate to="/decisions?status=completed" replace /></ProtectedRoute>} />
        <Route path="/analytics"               element={<ProtectedRoute><AppShell><AnalyticsPage /></AppShell></ProtectedRoute>} />
        <Route path="/ai"                       element={<ProtectedRoute><AppShell><AIAdvisorPage /></AppShell></ProtectedRoute>} />
        <Route path="/profile"                  element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />
        <Route path="/settings"                 element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />

        {/* Catch-all */}
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

  return <AnimatedRoutes />;
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
