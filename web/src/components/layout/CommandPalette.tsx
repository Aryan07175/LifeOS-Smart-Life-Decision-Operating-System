import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scale, BarChart3, Sparkles, CheckSquare,
  Plus, Search, X, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Overview', icon: LayoutDashboard, href: '/dashboard', group: 'Navigation' },
  { id: 'decisions', label: 'All Decisions', icon: Scale, href: '/decisions', group: 'Navigation' },
  { id: 'checkins', label: 'Pending Check-ins', icon: CheckSquare, href: '/checkins', group: 'Navigation' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics', group: 'Navigation' },
  { id: 'ai', label: 'AI Advisor', icon: Sparkles, href: '/ai', group: 'Navigation' },
  { id: 'new', label: 'New Decision', icon: Plus, href: '/decisions/new', group: 'Actions' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter(
    (c) =>
      !query ||
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.group.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].href);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, navigate, onClose]);

  const groups = Array.from(new Set(filtered.map((c) => c.group)));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search LifeOS..."
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <kbd className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No results for "{query}"</div>
              ) : (
                groups.map((group) => (
                  <div key={group}>
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{group}</p>
                    {filtered
                      .filter((c) => c.group === group)
                      .map((command, _i) => {
                        const globalIndex = filtered.findIndex((c) => c.id === command.id);
                        const isSelected = globalIndex === selected;
                        return (
                          <button
                            key={command.id}
                            onClick={() => { navigate(command.href); onClose(); }}
                            onMouseEnter={() => setSelected(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-100',
                              isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50',
                            )}
                          >
                            <command.icon className={cn('w-4 h-4', isSelected ? 'text-indigo-500' : 'text-gray-400')} />
                            <span className="flex-1 text-left font-medium">{command.label}</span>
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />}
                          </button>
                        );
                      })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-50 flex items-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1">ESC</kbd> Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
