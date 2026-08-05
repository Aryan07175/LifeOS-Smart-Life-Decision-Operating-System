import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scale, CheckSquare, BarChart3, Sparkles,
  User, Settings, ChevronDown, ChevronRight, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Decisions',
    icon: Scale,
    children: [
      { label: 'All Decisions', href: '/decisions' },
      { label: 'Active', href: '/decisions?status=active' },
      { label: 'Completed', href: '/decisions?status=completed' },
    ],
  },
  {
    label: 'Outcomes',
    icon: CheckSquare,
    children: [
      { label: 'Pending Check-ins', href: '/checkins' },
      { label: 'History', href: '/decisions?status=completed' },
    ],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'AI Advisor',
    href: '/ai',
    icon: Sparkles,
  },
];

const BOTTOM_ITEMS = [
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function NavItem({
  item,
  pendingCount = 0,
  collapsed = false,
}: {
  item: (typeof NAV_ITEMS)[0];
  pendingCount?: number;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => location.pathname === c.href.split('?')[0]);
  });

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            open
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
          )}
        >
          <item.icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </motion.div>
            </>
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="ml-7 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                {item.children.map((child) => {
                  const isActive = location.pathname === child.href.split('?')[0];
                  return (
                    <NavLink
                      key={child.href}
                      to={child.href}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        isActive
                          ? 'text-indigo-600 font-semibold bg-indigo-50'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                      )}
                    >
                      {child.label}
                      {child.label === 'Pending Check-ins' && pendingCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                          {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'text-indigo-600 bg-indigo-50 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        )
      }
    >
      <item.icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && item.label === 'AI Advisor' && (
        <span className="ml-auto text-[10px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-md tracking-wide">AI</span>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  pendingCount?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ pendingCount = 0, mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : undefined }}
        className={cn(
          'fixed top-0 left-0 h-full w-[240px] bg-white border-r border-gray-100 z-50 flex flex-col',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          !mobileOpen && '-translate-x-full lg:translate-x-0',
          'transition-transform duration-300 ease-in-out lg:transition-none',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-900 tracking-tight">LifeOS</span>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} pendingCount={pendingCount} />
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-100" />

        {/* Bottom nav */}
        <div className="px-3 py-3 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                )
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User footer */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-600">
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
