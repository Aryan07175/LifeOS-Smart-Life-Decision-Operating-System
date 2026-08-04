import React from 'react';
import { motion } from 'framer-motion';
import { getGreeting } from '@/lib/helpers';
import { Skeleton } from '@/components/ui/Skeleton';

interface GreetingProps {
  firstName?: string;
  isLoading?: boolean;
  pendingCount?: number;
}

export function Greeting({ firstName, isLoading, pendingCount = 0 }: GreetingProps) {
  const greeting = getGreeting();

  const subtitle =
    pendingCount > 0
      ? `You have ${pendingCount} check-in${pendingCount > 1 ? 's' : ''} waiting for your reflection.`
      : "All caught up. Ready to record a new decision?";

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-5 w-56 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight"
      >
        {greeting}, {firstName ?? 'there'}.{' '}
        <span className="animate-float inline-block">👋</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-1 text-[15px] text-gray-500"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
