import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * AnimatedNumber — Counts from 0 to target value with spring easing.
 * Used in KPI cards to add life to important metrics.
 */
export function AnimatedNumber({
  value,
  duration = 1.2,
  decimals = 0,
  className,
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0.1,
  });
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, suffix, decimals]);

  return (
    <span className={className}>
      {prefix}
      <span ref={displayRef}>0</span>
      {suffix}
    </span>
  );
}
