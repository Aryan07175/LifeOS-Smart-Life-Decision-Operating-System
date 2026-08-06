import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Sparkles, X, TrendingUp, Scale, Star, Bell, Activity, ChevronRight } from 'lucide-react';
import { analyticsApi } from '@/api/analytics';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { SkeletonKPI, Skeleton } from '@/components/ui/Skeleton';
import { getCategoryColor, getCategoryLabel } from '@/lib/helpers';
import type { UserInsight } from '@/api/analytics';

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-indigo-600 font-bold mt-0.5">{payload[0]?.value?.toFixed(1)}/10</p>
      <p className="text-gray-400">{payload[0]?.payload?.outcomeCount} outcomes</p>
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, iconBg, iconColor, suffix = '', decimals = 0, delay = 0 }: {
  label: string; value: number | null; icon: React.ElementType;
  iconBg: string; iconColor: string; suffix?: string; decimals?: number; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <SpotlightCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
            <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
          </div>
        </div>
        {value !== null ? (
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
          </p>
        ) : (
          <p className="text-3xl font-extrabold text-gray-200 tracking-tight">—</p>
        )}
        <p className="text-[13px] font-medium text-gray-500 mt-1">{label}</p>
      </SpotlightCard>
    </motion.div>
  );
}

// ── Insight Card ──────────────────────────────────────────────────────────────
function InsightCard({ insight, onDismiss }: { insight: UserInsight; onDismiss: (id: string) => void }) {
  const sigColor = insight.significance >= 8 ? '#EF4444' : insight.significance >= 6 ? '#F59E0B' : '#10B981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <SpotlightCard className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-sm font-bold text-gray-900 leading-snug">{insight.title}</p>
              <button onClick={() => onDismiss(insight.id)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{insight.description}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sigColor }} />
                <span className="text-xs font-medium text-gray-400">Significance {insight.significance}/10</span>
              </div>
              {insight.category && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: getCategoryColor(insight.category) + '18', color: getCategoryColor(insight.category) }}>
                  {getCategoryLabel(insight.category)}
                </span>
              )}
              {insight.actionable && insight.actionSuggestion && (
                <span className="text-xs font-bold text-indigo-500 ml-auto flex items-center gap-1">
                  Action <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
            {insight.actionable && insight.actionSuggestion && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-xl">
                <p className="text-xs font-semibold text-indigo-700">💡 {insight.actionSuggestion}</p>
              </div>
            )}
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

// ── Pattern Card ──────────────────────────────────────────────────────────────
function PatternCard({ pattern }: { pattern: any }) {
  const strengthConfig: Record<string, { color: string; bg: string }> = {
    strong: { color: '#EF4444', bg: '#FEF2F2' },
    moderate: { color: '#F59E0B', bg: '#FFFBEB' },
    weak: { color: '#10B981', bg: '#ECFDF5' },
  };
  const s = strengthConfig[pattern.strength] ?? { color: '#6B7280', bg: '#F9FAFB' };

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
        <TrendingUp className="w-4 h-4" style={{ color: s.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 mb-0.5">{pattern.pattern?.condition}</p>
        <p className="text-xs text-gray-500">→ {pattern.pattern?.outcome}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="neutral" className="capitalize text-[11px]" style={{ backgroundColor: s.bg, color: s.color } as React.CSSProperties}>
            {pattern.strength} signal
          </Badge>
          {pattern.category && (
            <span className="text-xs text-gray-400">{getCategoryLabel(pattern.category)}</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold text-gray-500">{Math.round((pattern.pattern?.confidence ?? 0) * 100)}%</p>
        <p className="text-[10px] text-gray-400">confidence</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const queryClient = useQueryClient();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: analyticsApi.getSummary,
    staleTime: 1000 * 60 * 5,
  });

  const { data: quality = [], isLoading: qualityLoading } = useQuery({
    queryKey: ['analytics', 'quality-over-time'],
    queryFn: analyticsApi.getQualityOverTime,
    staleTime: 1000 * 60 * 10,
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: analyticsApi.getInsights,
    staleTime: 1000 * 60 * 5,
  });

  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['analytics', 'patterns'],
    queryFn: analyticsApi.getPatterns,
    staleTime: 1000 * 60 * 10,
  });

  const dismissMutation = useMutation({
    mutationFn: analyticsApi.dismissInsight,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analytics', 'insights'] }),
  });

  const activeInsights = insights.filter((i) => !i.dismissed);

  const formattedQuality = quality.map((d) => ({
    ...d,
    month: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  const categoryData = (summary?.topCategories ?? []).map((c) => ({
    name: getCategoryLabel(c.category),
    count: c.count,
    color: getCategoryColor(c.category),
  }));

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 space-y-10">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Track your decision-making patterns and outcomes</p>
      </div>

      {/* ── KPI Cards ── */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Summary</p>
        {summaryLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <SkeletonKPI key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard label="Total Decisions" value={summary?.totalDecisions ?? 0} icon={Scale} iconBg="#E8E6FF" iconColor="#4F46E5" delay={0} />
            <KPICard label="Avg Confidence" value={summary?.averageConfidence ?? null} icon={Activity} iconBg="#ECFDF5" iconColor="#10B981" suffix="/10" decimals={1} delay={0.06} />
            <KPICard label="Avg Satisfaction" value={summary?.averageSatisfaction ?? null} icon={Star} iconBg="#FFFBEB" iconColor="#F59E0B" suffix="/10" decimals={1} delay={0.12} />
            <KPICard label="Pending Check-ins" value={summary?.pendingCheckins ?? 0} icon={Bell} iconBg="#FEF2F2" iconColor="#EF4444" delay={0.18} />
          </div>
        )}
      </section>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Bar Chart */}
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Decisions by Category</p>
          {summaryLoading ? <Skeleton className="h-52 w-full rounded-2xl" /> : (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={({ active, payload }) => active && payload?.length
                    ? <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow text-xs"><p className="font-bold">{payload[0]?.value} decisions</p></div>
                    : null} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={800}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Quality Over Time */}
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Satisfaction Over Time</p>
          {qualityLoading ? <Skeleton className="h-52 w-full rounded-2xl" /> : formattedQuality.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 h-[232px] flex items-center justify-center">
              <p className="text-sm text-gray-400">Complete check-ins to see your trend.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={formattedQuality} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<AreaTooltip />} />
                  <Area type="monotone" dataKey="avgSatisfaction" stroke="#4F46E5" strokeWidth={2} fill="url(#areaGrad)"
                    dot={{ fill: '#4F46E5', r: 3 }} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* ── Behavioral Patterns ── */}
      {!patternsLoading && patterns.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Behavioral Patterns</p>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {patterns.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                <PatternCard pattern={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── AI Insights ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Insights</p>
          {activeInsights.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-indigo-100 text-indigo-600 rounded-full">
              {activeInsights.length}
            </span>
          )}
        </div>
        {insightsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : activeInsights.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No insights yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete more check-ins to unlock AI-generated insights.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} onDismiss={(id) => dismissMutation.mutate(id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
