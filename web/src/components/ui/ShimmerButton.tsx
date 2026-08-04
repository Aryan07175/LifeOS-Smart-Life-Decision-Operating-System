import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  shimmer?: boolean;
  icon?: React.ReactNode;
}

/**
 * ShimmerButton — Premium button with light shimmer sweep animation.
 * Inspira UI aesthetic for primary CTAs.
 */
export function ShimmerButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  shimmer = true,
  icon,
  className,
  disabled,
  ...props
}: ShimmerButtonProps) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 select-none';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(79,70,229,0.3)]',
    secondary:
      'bg-white text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-[0.98]',
    danger:
      'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-[0_4px_14px_rgba(239,68,68,0.3)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer sweep */}
      {shimmer && variant === 'primary' && (
        <span
          className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Loading spinner */}
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}

      <span>{children}</span>
    </button>
  );
}
