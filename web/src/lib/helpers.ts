// ─── Category Helpers ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  career: '💼',
  financial: '💰',
  health: '❤️',
  relationship: '👥',
  education: '🎓',
  lifestyle: '🌿',
  business: '📈',
  personal_growth: '🚀',
  family: '🏠',
  other: '⭕',
};

const CATEGORY_COLORS: Record<string, string> = {
  career: '#3B82F6',
  financial: '#10B981',
  health: '#F59E0B',
  relationship: '#EC4899',
  education: '#8B5CF6',
  lifestyle: '#06B6D4',
  business: '#F97316',
  personal_growth: '#6366F1',
  family: '#E11D48',
  other: '#6B7280',
};

const CATEGORY_BG: Record<string, string> = {
  career: '#EFF6FF',
  financial: '#ECFDF5',
  health: '#FFFBEB',
  relationship: '#FDF2F8',
  education: '#F5F3FF',
  lifestyle: '#ECFEFF',
  business: '#FFF7ED',
  personal_growth: '#EEF2FF',
  family: '#FFF1F2',
  other: '#F9FAFB',
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '⭕';
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6B7280';
}

export function getCategoryBg(category: string): string {
  return CATEGORY_BG[category] ?? '#F9FAFB';
}

export function getCategoryLabel(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: '#10B981',
    completed: '#4F46E5',
    archived: '#6B7280',
    superseded: '#F59E0B',
    resolved: '#10B981',
  };
  return map[status] ?? '#6B7280';
}

export function getStatusBg(status: string): string {
  const map: Record<string, string> = {
    active: '#ECFDF5',
    completed: '#E8E6FF',
    archived: '#F3F4F6',
    superseded: '#FFFBEB',
    resolved: '#ECFDF5',
  };
  return map[status] ?? '#F3F4F6';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
    superseded: 'Superseded',
    resolved: 'Resolved',
  };
  return map[status] ?? status;
}

// ─── Confidence Helpers ───────────────────────────────────────────────────────

export function getConfidenceColor(level: number): string {
  if (level >= 8) return '#10B981';
  if (level >= 5) return '#F59E0B';
  return '#EF4444';
}

export function getConfidenceLabel(level: number): string {
  if (level >= 9) return 'Unshakeable';
  if (level >= 7) return 'Strongly Leaning';
  if (level >= 5) return 'Moderately Confident';
  if (level >= 3) return 'Somewhat Uncertain';
  return 'Very Uncertain';
}

// ─── Date/Time Helpers ────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Just now';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getUrgencyInfo(dateStr: string): {
  color: string;
  bgColor: string;
  textColor: string;
  label: string;
} {
  const days = getDaysUntil(dateStr);
  if (days <= 0) return { color: '#DC2626', bgColor: '#FEF2F2', textColor: '#DC2626', label: 'Overdue' };
  if (days <= 3) return { color: '#EA580C', bgColor: '#FFF7ED', textColor: '#EA580C', label: `Due in ${days}d` };
  if (days <= 7) return { color: '#F59E0B', bgColor: '#FFFBEB', textColor: '#D97706', label: `Due in ${days}d` };
  return { color: '#059669', bgColor: '#ECFDF5', textColor: '#059669', label: `Due in ${days}d` };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ─── Reminder Label ───────────────────────────────────────────────────────────

export const REMINDER_LABELS: Record<string, string> = {
  '1_day': '1-Day Check-in',
  '1_week': '1-Week Check-in',
  '2_weeks': '2-Week Check-in',
  '1_month': '1-Month Check-in',
  '3_months': '3-Month Check-in',
  '6_months': '6-Month Check-in',
  '1_year': '1-Year Review',
  '2_years': '2-Year Review',
  target_date: 'Target Date Review',
  custom: 'Custom Check-in',
};

export function getReminderLabel(type: string): string {
  return REMINDER_LABELS[type] ?? 'Check-in';
}
