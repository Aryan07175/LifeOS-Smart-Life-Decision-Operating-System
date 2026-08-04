import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Scale, Star, Activity, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { SkeletonKPI } from '@/components/ui/Skeleton';
import type { AnalyticsSummary } from '@/api/analytics';

interface StatCardProps {
  label: string;
  value: number | null;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  suffix?: string;
  decimals?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, suffix = '', decimals = 0, trend, trendLabel, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <SpotlightCard className="p-5 h-full" spotlightColor="rgba(79, 70, 229, 0.06)">
        <div className="space-y-3">
          {/* Icon + trend */}
          <div className="flex items-center justify-between">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: iconBg }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
            </div>
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-semibold',
                trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400',
              )}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                  trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                    <Minus className="w-3 h-3" />}
                <span>{trendLabel}</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div>
            {value !== null && value !== undefined ? (
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
              </p>
            ) : (
              <p className="text-3xl font-extrabold text-gray-300 tracking-tight leading-none">—</p>
            )}
          </div>

          {/* Label */}
          <p className="text-[13px] font-medium text-gray-500">{label}</p>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

interface DecisionHealthStatsProps {
  summary?: AnalyticsSummary;
  isLoading: boolean;
}

export function DecisionHealthStats({ summary, isLoading }: DecisionHealthStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Decision Health</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <SkeletonKPI key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Decision Health</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Decisions"
          value={summary?.totalDecisions ?? 0}
          icon={Scale}
          iconColor="#4F46E5"
          iconBg="#E8E6FF"
          delay={0}
        />
        <StatCard
          label="Avg Confidence"
          value={summary?.averageConfidence ?? null}
          icon={Activity}
          iconColor="#10B981"
          iconBg="#ECFDF5"
          suffix="/10"
          decimals={1}
          delay={0.06}
        />
        <StatCard
          label="Avg Satisfaction"
          value={summary?.averageSatisfaction ?? null}
          icon={Star}
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
          suffix="/10"
          decimals={1}
          delay={0.12}
        />
        <StatCard
          label="Pending Check-ins"
          value={summary?.pendingCheckins ?? 0}
          icon={Bell}
          iconColor="#EF4444"
          iconBg="#FEF2F2"
          delay={0.18}
        />
      </div>
    </div>
  );
}
