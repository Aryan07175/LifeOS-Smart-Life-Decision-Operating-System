import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { GlowBorder } from '@/components/ui/GlowBorder';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import type { UserInsight } from '@/api/analytics';
import { cn } from '@/lib/utils';

interface AIInsightCardProps {
  insight?: UserInsight;
  isLoading: boolean;
}

function SignificanceDots({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors',
            i < Math.round(value / 2) ? 'bg-indigo-500' : 'bg-gray-200',
          )}
        />
      ))}
    </div>
  );
}

export function AIInsightCard({ insight, isLoading }: AIInsightCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    mutationFn: (id: string) => analyticsApi.dismissInsight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'insights'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Insight</p>
        <div className="h-[160px] bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-3"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Insight</p>
      <GlowBorder borderRadius="16px">
        <SpotlightCard
          className="p-5 rounded-2xl"
          spotlightColor="rgba(79, 70, 229, 0.06)"
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">AI Analysis</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{insight.title}</p>
                </div>
              </div>
              <button
                onClick={() => dismissMutation.mutate(insight.id)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <SignificanceDots value={insight.significance} />
                <span className="text-[11px] text-gray-400 font-medium">Significance {insight.significance}/10</span>
              </div>
              {insight.actionable && (
                <button
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Explore <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </SpotlightCard>
      </GlowBorder>
    </motion.div>
  );
}
