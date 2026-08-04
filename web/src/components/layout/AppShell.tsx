import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { useQuery } from '@tanstack/react-query';
import { decisionsApi } from '@/api/decisions';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — Root layout with sidebar, header, Lenis smooth scroll, command palette.
 * All authenticated pages render inside this shell.
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Pending check-ins count for badge
  const { data: checkins = [] } = useQuery({
    queryKey: ['outcomes', 'pending-checkins'],
    queryFn: decisionsApi.getPendingCheckins,
    staleTime: 1000 * 60 * 2,
  });

  // ── Lenis smooth scroll ──
  useEffect(() => {
    const lenis = new Lenis({
      wrapper: mainRef.current ?? undefined,
      content: mainRef.current?.firstElementChild as HTMLElement ?? undefined,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Pause when command palette opens
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // ── Global keyboard shortcut for command palette ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Pause Lenis when modal is open
  useEffect(() => {
    if (commandOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [commandOpen]);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        pendingCount={checkins.length}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          pendingCount={checkins.length}
          onMobileMenuOpen={() => setMobileOpen(true)}
          onCommandOpen={() => setCommandOpen(true)}
        />

        {/* Scrollable content area — Lenis target */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
