import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical, CheckCircle, Calendar, Target, Edit, Trash2, Plus } from 'lucide-react';
import { decisionsApi } from '@/api/decisions';
import { getCategoryColor, getCategoryLabel, getStatusLabel, formatDate } from '@/lib/helpers';

import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Skeleton } from '@/components/ui/Skeleton';

function SatisfactionDot({ score }: { score: number }) {
  const color = score >= 8 ? '#10B981' : score >= 6 ? '#4F46E5' : score >= 4 ? '#F59E0B' : '#EF4444';
  return <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />;
}

export default function DecisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'context' | 'outcomes'>('context');
  const [showMenu, setShowMenu] = useState(false);

  const { data: decision, isLoading } = useQuery({
    queryKey: ['decision', id],
    queryFn: () => decisionsApi.getDecision(id!),
    enabled: !!id,
  });

  const { data: outcomes = [] } = useQuery({
    queryKey: ['outcomes', id],
    queryFn: () => decisionsApi.getOutcomes(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => decisionsApi.deleteDecision(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      navigate('/decisions');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-8 w-3/4 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!decision) return null;

  const catColor = getCategoryColor(decision.category);

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <ShimmerButton
            size="sm"
            onClick={() => navigate(`/decisions/${id}/checkin`)}
            icon={<CheckCircle className="w-3.5 h-3.5" />}
          >
            Check In
          </ShimmerButton>

          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-20">
                <button onClick={() => { setShowMenu(false); navigate(`/decisions/new?editId=${id}`); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => { setShowMenu(false); if (confirm('Delete this decision?')) deleteMutation.mutate(); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}99)` }}
      >
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">
            {getCategoryLabel(decision.category)}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold leading-snug mb-4">{decision.title}</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <span className="text-sm text-white/80">{getStatusLabel(decision.status)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white/80">Confidence: {decision.confidenceLevel}/10</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/60" />
            <span className="text-sm text-white/80">{formatDate(decision.decisionDate)}</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(['context', 'outcomes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
              activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'outcomes' ? `Outcomes (${outcomes.length})` : 'Context'}
          </button>
        ))}
      </div>

      {/* Context Tab */}
      {activeTab === 'context' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {decision.description && (
            <SpotlightCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{decision.description}</p>
            </SpotlightCard>
          )}

          {decision.context && (
            <SpotlightCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Context & Nuance</p>
              <p className="text-sm text-gray-700 leading-relaxed">{decision.context}</p>
            </SpotlightCard>
          )}

          {decision.reasoningProcess && (
            <SpotlightCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">My Reasoning</p>
              <p className="text-sm text-gray-700 leading-relaxed">{decision.reasoningProcess}</p>
            </SpotlightCard>
          )}

          {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 && (
            <SpotlightCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Alternatives Considered</p>
              <div className="space-y-3">
                {decision.alternativesConsidered.map((alt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-500">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{alt.option}</p>
                      {alt.whyNotChosen && (
                        <p className="text-xs text-gray-500 mt-0.5">{alt.whyNotChosen}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          )}

          {decision.expectedOutcomes && decision.expectedOutcomes.length > 0 && (
            <SpotlightCard className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Expected Outcomes</p>
              <div className="space-y-2">
                {decision.expectedOutcomes.map((eo, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{eo.outcome}</p>
                      {eo.metric && <p className="text-xs text-gray-400">{eo.metric}: {eo.targetValue}</p>}
                    </div>
                    {eo.importance && (
                      <span className="text-xs font-bold text-indigo-500">{eo.importance}/5</span>
                    )}
                  </div>
                ))}
              </div>
            </SpotlightCard>
          )}

          {decision.expectedOutcomeDate && (
            <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Expected by {formatDate(decision.expectedOutcomeDate)}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Outcomes Tab */}
      {activeTab === 'outcomes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {outcomes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mb-4">No check-ins recorded yet.</p>
              <ShimmerButton size="sm" onClick={() => navigate(`/decisions/${id}/checkin`)}
                icon={<Plus className="w-3.5 h-3.5" />}>
                Record First Check-in
              </ShimmerButton>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-100" />
              <div className="space-y-4">
                {outcomes.map((outcome, i) => (
                  <motion.div
                    key={outcome.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className="flex gap-4"
                  >
                    <div className="relative z-10 mt-4">
                      <SatisfactionDot score={outcome.satisfactionScore} />
                    </div>
                    <SpotlightCard className="flex-1 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400">{formatDate(outcome.createdAt)}</span>
                        <span className="text-sm font-extrabold text-gray-900">{outcome.satisfactionScore}/10</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{outcome.actualResults}</p>
                      {outcome.lessonsLearned && (
                        <p className="text-xs text-indigo-600 mt-2 italic">💡 {outcome.lessonsLearned}</p>
                      )}
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
