import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, SkipForward } from 'lucide-react';

import { getUrgencyInfo, getReminderLabel, formatDate } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import type { PendingCheckin } from '@/api/decisions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { decisionsApi } from '@/api/decisions';

function CheckInCard({ item, index }: { item: PendingCheckin; index: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urgency = getUrgencyInfo(item.scheduledDate);
  const reminderLabel = getReminderLabel(item.reminderType);

  const skipMutation = useMutation({
    mutationFn: () => decisionsApi.skipCheckin(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outcomes', 'pending-checkins'] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-[300px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-300"
    >
      {/* Urgency accent bar */}
      <div className="h-1" style={{ backgroundColor: urgency.color }} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: urgency.bgColor, color: urgency.textColor }}
          >
            <Calendar className="w-3 h-3" />
            {reminderLabel}
          </span>
          <span className="text-xs font-bold flex-shrink-0" style={{ color: urgency.textColor }}>
            {urgency.label}
          </span>
        </div>

        {/* Decision title */}
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2">
            {item.customMessage || item.decision?.title || 'Outcome Review'}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Created {formatDate(item.createdAt)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.confirm('Skip this check-in? You can check in manually later.')) {
                skipMutation.mutate();
              }
            }}
            disabled={skipMutation.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>

          <ShimmerButton
            size="sm"
            onClick={() => navigate(`/decisions/${item.decisionId}/checkin`)}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            className="flex-[2] py-2.5 text-xs rounded-xl"
          >
            Complete
          </ShimmerButton>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="bg-emerald-50 rounded-2xl p-5 flex items-center gap-4 border border-emerald-100">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-emerald-800">All caught up</p>
        <p className="text-xs text-emerald-600 mt-0.5">No pending check-ins. New ones appear when decisions need reviewing.</p>
      </div>
    </div>
  );
}

interface PendingCheckInsProps {
  checkins: PendingCheckin[];
  isLoading: boolean;
}

export function PendingCheckIns({ checkins, isLoading }: PendingCheckInsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending Check-ins</p>
          {checkins.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {checkins.length}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="w-[300px] h-[196px] flex-shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : checkins.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-0 px-0 snap-x snap-mandatory scroll-smooth" data-lenis-prevent>
          {checkins.map((item, i) => (
            <div key={item.id} className="snap-start flex-shrink-0">
              <CheckInCard item={item} index={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
