import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, X, ChevronRight, Bell } from 'lucide-react';
import { decisionsApi } from '@/api/decisions';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getCategoryColor, getCategoryLabel, getUrgencyInfo, getReminderLabel, formatDate } from '@/lib/helpers';
import type { PendingCheckin } from '@/api/decisions';

function CheckInCard({ checkin, index }: { checkin: PendingCheckin; index: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const skipMutation = useMutation({
    mutationFn: () => decisionsApi.skipCheckin(checkin.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outcomes', 'pending-checkins'] }),
  });

  const catColor = getCategoryColor(checkin.decision?.category ?? 'other');
  const urgency = getUrgencyInfo(checkin.scheduledDate);
  const reminderLabel = getReminderLabel(checkin.reminderType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <SpotlightCard className="overflow-hidden">
        <div className="flex items-stretch">
          {/* Left accent */}
          <div className="w-1 flex-shrink-0" style={{ backgroundColor: catColor }} />

          <div className="flex-1 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Reminder type badge */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: catColor + '18', color: catColor }}
                  >
                    {getCategoryLabel(checkin.decision?.category ?? 'other')}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: urgency.bgColor, color: urgency.textColor }}
                  >
                    {urgency.label}
                  </span>
                </div>

                {/* Decision title */}
                <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                  {checkin.decision?.title ?? 'Decision Check-in'}
                </h3>

                {/* Reminder type */}
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {reminderLabel} · {formatDate(checkin.scheduledDate)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <ShimmerButton
                size="sm"
                onClick={() => navigate(`/decisions/${checkin.decisionId}/checkin`)}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
                className="flex-1"
              >
                Check In Now
              </ShimmerButton>
              <button
                onClick={() => skipMutation.mutate()}
                disabled={skipMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Skip
              </button>
              <button
                onClick={() => navigate(`/decisions/${checkin.decisionId}`)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        No pending check-ins right now. Keep recording your decisions to stay on top of outcomes.
      </p>
      <ShimmerButton onClick={() => navigate('/decisions/new')}>
        Record a Decision
      </ShimmerButton>
    </div>
  );
}

export default function CheckInsListPage() {
  const { data: checkins = [], isLoading } = useQuery({
    queryKey: ['outcomes', 'pending-checkins'],
    queryFn: decisionsApi.getPendingCheckins,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
          <Bell className="w-4.5 h-4.5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pending Check-ins</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading ? '...' : `${checkins.length} decision${checkins.length !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : checkins.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {checkins.map((c, i) => (
            <CheckInCard key={c.id} checkin={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
