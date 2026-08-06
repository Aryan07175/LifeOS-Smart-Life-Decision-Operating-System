import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { getCategoryColor, getCategoryLabel } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AnalyticsSummary } from '@/api/analytics';

interface CategoryBreakdownProps {
  data?: AnalyticsSummary['topCategories'];
  isLoading: boolean;
}

export function CategoryBreakdown({ data, isLoading }: CategoryBreakdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Category Breakdown</p>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3" ref={ref}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Decisions by Category</p>
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="space-y-4">
          {data.map((item, i) => {
            const color = getCategoryColor(item.category);
            const pct = Math.round((item.count / maxCount) * 100);

            return (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{item.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${pct}%` } : { width: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
