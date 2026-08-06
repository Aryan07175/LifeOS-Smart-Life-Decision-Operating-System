import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Bell, Plus, Menu, Command,
} from 'lucide-react';

import { ShimmerButton } from '@/components/ui/ShimmerButton';

interface HeaderProps {
  pendingCount?: number;
  onMobileMenuOpen?: () => void;
  onCommandOpen?: () => void;
}

export function Header({ pendingCount = 0, onMobileMenuOpen, onCommandOpen }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 lg:px-6 h-14 flex items-center gap-4">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Search / Command Palette trigger */}
      <button
        onClick={onCommandOpen}
        className="flex items-center gap-2 flex-1 max-w-xs h-9 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-400 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all duration-200 group"
        aria-label="Open command palette"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />
        <span className="flex-1 text-left truncate">Search decisions, insights...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded-md px-1.5 py-0.5">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Notification bell */}
      <button
        onClick={() => navigate('/checkins')}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label={`${pendingCount} pending check-ins`}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {pendingCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {pendingCount > 9 ? '9+' : pendingCount}
          </motion.span>
        )}
      </button>

      {/* New Decision CTA */}
      <ShimmerButton
        size="sm"
        onClick={() => navigate('/decisions/new')}
        icon={<Plus className="w-4 h-4" />}
        className="hidden sm:inline-flex"
      >
        New Decision
      </ShimmerButton>
    </header>
  );
}
