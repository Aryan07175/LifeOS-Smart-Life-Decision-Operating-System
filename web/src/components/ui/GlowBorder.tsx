import React from 'react';
import { cn } from '@/lib/utils';

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderRadius?: string;
}

/**
 * GlowBorder — Inspira UI style animated conic gradient border.
 * Creates a rotating glow effect around the wrapped content.
 */
export function GlowBorder({
  children,
  className,
  glowColor = '#4f46e5',
  borderRadius = '16px',
}: GlowBorderProps) {
  return (
    <div
      className={cn('relative p-[1.5px] overflow-hidden', className)}
      style={{ borderRadius }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius,
          background: `conic-gradient(from 0deg, transparent 0deg, ${glowColor}60 60deg, ${glowColor} 120deg, ${glowColor}60 180deg, transparent 240deg)`,
          animation: 'spin 3s linear infinite',
        }}
      />
      {/* Static subtle glow */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius,
          background: `linear-gradient(135deg, ${glowColor}20, transparent 60%)`,
        }}
      />
      {/* Content */}
      <div
        className="relative bg-white"
        style={{ borderRadius: `calc(${borderRadius} - 1.5px)` }}
      >
        {children}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
