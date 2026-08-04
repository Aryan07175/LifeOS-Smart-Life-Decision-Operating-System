import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * SpotlightCard — Inspira UI style card with mouse-tracking spotlight effect.
 * The spotlight follows the cursor, creating a premium interactive feel.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(79, 70, 229, 0.08)',
  onMouseMove: externalMouseMove,
  onMouseEnter: externalMouseEnter,
  onMouseLeave: externalMouseLeave,
  style: externalStyle,
  ...rest
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    externalMouseMove?.(e);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { setIsHovered(true); externalMouseEnter?.(e); }}
      onMouseLeave={(e) => { setIsHovered(false); externalMouseLeave?.(e); }}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white border border-gray-100 transition-shadow duration-300',
        isHovered ? 'shadow-[0_8px_32px_rgba(0,0,0,0.10)]' : 'shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className,
      )}
      style={{
        background: isHovered
          ? `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%), white`
          : 'white',
        ...externalStyle,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

