import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

/**
 * Skeleton — Shimmer loading placeholder that matches final content shape.
 */
export function Skeleton({ className, width, height, rounded = 'rounded-xl', style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('relative overflow-hidden bg-gray-100', rounded, className)}
      style={{ width, height, ...style }}
      {...rest}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl p-5 border border-gray-100 space-y-3', className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonKPI({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl p-5 border border-gray-100 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-12 h-4 rounded-full" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
      <Skeleton className="h-3 w-28 rounded" />
    </div>
  );
}
