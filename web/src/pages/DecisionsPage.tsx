import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, X } from 'lucide-react';
import { decisionsApi } from '@/api/decisions';
import { ShimmerButton } from '@/components/ui/ShimmerButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { getCategoryColor, getCategoryLabel, getStatusLabel, getStatusColor, getStatusBg, timeAgo } from '@/lib/helpers';
import type { Decision } from '@/api/decisions';

const STATUS_FILTERS = ['All', 'active', 'completed', 'archived'];

function DecisionCard({ decision, index }: { decision: Decision; index: number }) {
  const navigate = useNavigate();
  const catColor = getCategoryColor(decision.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <SpotlightCard
        className="cursor-pointer overflow-visible"
        onClick={() => navigate(`/decisions/${decision.id}`)}
      >
        <div className="flex items-stretch">
          {/* Category accent */}
          <div className="w-1 rounded-l-2xl flex-shrink-0" style={{ backgroundColor: catColor }} />

          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Category + Status */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: catColor + '18', color: catColor }}
                  >
                    {getCategoryLabel(decision.category)}
                  </span>
                  <Badge
                    variant="neutral"
                    className="text-[11px]"
                    style={{ backgroundColor: getStatusBg(decision.status), color: getStatusColor(decision.status) } as React.CSSProperties}
                  >
                    {getStatusLabel(decision.status)}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
                  {decision.title}
                </h3>

                {/* Description */}
                {decision.description && (
                  <p className="text-sm text-gray-500 line-clamp-1 mb-3">{decision.description}</p>
                )}
              </div>

              {/* Confidence ring */}
              <div className="flex-shrink-0 text-center">
                <p className="text-lg font-extrabold text-indigo-600">{decision.confidenceLevel}</p>
                <p className="text-[10px] text-gray-400 font-medium">/10</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{timeAgo(decision.createdAt)}</span>
              {decision.tags && decision.tags.length > 0 && (
                <>
                  <span>·</span>
                  {decision.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">#{tag}</span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-2xl">⚖️</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">No decisions yet</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Record your first decision. Every great decision starts with awareness.
      </p>
      <ShimmerButton onClick={onNew} icon={<Plus className="w-4 h-4" />}>
        Record First Decision
      </ShimmerButton>
    </div>
  );
}

export default function DecisionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'All');

  const { data, isLoading } = useQuery({
    queryKey: ['decisions', status, 1],
    queryFn: () => decisionsApi.getDecisions({
      status: status === 'All' ? undefined : status,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    staleTime: 1000 * 60 * 2,
  });

  const decisions = (data?.data ?? []).filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Decisions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.pagination.total ?? 0} total decisions recorded
          </p>
        </div>
        <ShimmerButton onClick={() => navigate('/decisions/new')} icon={<Plus className="w-4 h-4" />}>
          New Decision
        </ShimmerButton>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 bg-white transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize ${
                status === s
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : decisions.length === 0 ? (
        <EmptyState onNew={() => navigate('/decisions/new')} />
      ) : (
        <div className="space-y-3">
          {decisions.map((d, i) => (
            <DecisionCard key={d.id} decision={d} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
