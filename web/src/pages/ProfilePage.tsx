import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { analyticsApi } from '@/api/analytics';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const { user, clearTokens } = useAuthStore();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.getSummary,
    staleTime: 1000 * 60 * 5,
  });

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearTokens();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account and decision intelligence overview</p>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <SpotlightCard className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-extrabold text-indigo-600">
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl font-extrabold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-sm text-emerald-600 font-medium">Active account</p>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* Stats */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Decision Intelligence</p>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Decisions', value: summary?.totalDecisions ?? 0, decimals: 0, suffix: '' },
              { label: 'Avg Satisfaction', value: summary?.averageSatisfaction ?? null, decimals: 1, suffix: '/10' },
              { label: 'Check-ins', value: summary?.totalOutcomes ?? 0, decimals: 0, suffix: '' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <SpotlightCard className="p-4 text-center">
                  {stat.value !== null ? (
                    <p className="text-2xl font-extrabold text-gray-900">
                      <AnimatedNumber value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                    </p>
                  ) : (
                    <p className="text-2xl font-extrabold text-gray-300">—</p>
                  )}
                  <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Account Settings */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Account</p>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-5 py-4">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 flex-1">Display Name</span>
            <span className="text-sm text-gray-900 font-semibold">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 flex-1">Email</span>
            <span className="text-sm text-gray-500">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 flex-1">Privacy</span>
            <span className="text-sm text-gray-500">Decisions are private by default</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Session</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-full py-2.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              Sign Out
            </button>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-700 font-medium">Are you sure you want to sign out?</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmLogout(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
