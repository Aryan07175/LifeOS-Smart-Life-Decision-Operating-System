import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { analyticsApi } from '@/api/analytics';
import { decisionsApi } from '@/api/decisions';
import { useAuthStore } from '@/store/authStore';
import { Greeting } from '@/components/dashboard/Greeting';
import { PendingCheckIns } from '@/components/dashboard/PendingCheckIns';
import { DecisionHealthStats } from '@/components/dashboard/DecisionHealthStats';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { SatisfactionTrend } from '@/components/dashboard/SatisfactionTrend';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { ShimmerButton } from '@/components/ui/ShimmerButton';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.getSummary,
    staleTime: 1000 * 60 * 3,
  });

  const { data: checkins = [], isLoading: checkinsLoading } = useQuery({
    queryKey: ['outcomes', 'pending-checkins'],
    queryFn: decisionsApi.getPendingCheckins,
    staleTime: 1000 * 60 * 2,
  });

  const { data: qualityData = [], isLoading: qualityLoading } = useQuery({
    queryKey: ['analytics', 'quality-over-time'],
    queryFn: analyticsApi.getQualityOverTime,
    staleTime: 1000 * 60 * 10,
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: analyticsApi.getInsights,
    staleTime: 1000 * 60 * 5,
  });

  const topInsight = insights.find((i) => !i.dismissed);

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8 space-y-8">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4">
        <Greeting
          firstName={user?.firstName}
          isLoading={false}
          pendingCount={checkins.length}
        />
        <ShimmerButton
          onClick={() => navigate('/decisions/new')}
          icon={<Plus className="w-4 h-4" />}
          className="flex-shrink-0 hidden md:inline-flex"
        >
          New Decision
        </ShimmerButton>
      </div>

      {/* ── Pending Check-ins ── */}
      <PendingCheckIns checkins={checkins} isLoading={checkinsLoading} />

      {/* ── Decision Health KPIs ── */}
      <DecisionHealthStats summary={summary} isLoading={summaryLoading} />

      {/* ── Category Breakdown + Satisfaction Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown data={summary?.topCategories} isLoading={summaryLoading} />
        <SatisfactionTrend data={qualityData} isLoading={qualityLoading} />
      </div>

      {/* ── AI Insight ── */}
      <AIInsightCard insight={topInsight} isLoading={insightsLoading} />
    </div>
  );
}
