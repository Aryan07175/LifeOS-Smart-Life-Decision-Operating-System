import type { TextStyle, ViewStyle } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────
export const COLORS = {
  // Surface
  surface: '#F9FAFB' as const,
  surfaceLow: '#F3F4F5' as const,
  surfaceLowest: '#FFFFFF' as const,
  surfaceDim: '#E5E7EB' as const,
  surfaceContainer: '#EDEEEF' as const,
  skeleton: '#EDEEEF' as const,
  scaffold: '#D9DADB' as const,

  // Text
  textPrimary: '#111827' as const,
  textSecondary: '#6B7280' as const,
  textMuted: '#464555' as const,
  textOnPrimary: '#FFFFFF' as const,
  textBody: '#374151' as const,

  // Brand
  primary: '#4F46E5' as const,
  primaryDark: '#3525CD' as const,
  primaryFixed: '#E2DFFF' as const,
  primarySurface: '#E8E6FF' as const,

  // Utility
  success: '#10B981' as const,
  successBg: '#ECFDF5' as const,
  warning: '#F59E0B' as const,
  warningBg: '#FFFBEB' as const,
  danger: '#EF4444' as const,
  dangerBg: '#FEF2F2' as const,

  // Outline
  outline: '#777587' as const,
  outlineVariant: '#C7C4D8' as const,
  divider: '#E5E7EB' as const,
  inputBorder: '#D1D5DB' as const,

  // Category colors
  career: '#3B82F6' as const,
  financial: '#10B981' as const,
  health: '#F59E0B' as const,
  relationship: '#EC4899' as const,
  education: '#8B5CF6' as const,
  lifestyle: '#06B6D4' as const,
  business: '#F97316' as const,
  personalGrowth: '#6366F1' as const,
  family: '#E11D48' as const,

  // Category backgrounds (light)
  careerBg: '#EFF6FF' as const,
  financialBg: '#ECFDF5' as const,
  healthBg: '#FFFBEB' as const,
  relationshipBg: '#FDF2F8' as const,
  educationBg: '#F5F3FF' as const,
  lifestyleBg: '#ECFEFF' as const,
  businessBg: '#FFF7ED' as const,
  personalGrowthBg: '#EEF2FF' as const,
  familyBg: '#FFF1F2' as const,
};

// ─── Spacing Scale ────────────────────────────────────────────────────
export const SPACING = {
  xxs: 2 as const,
  xs: 4 as const,
  sm: 8 as const,
  md: 12 as const,
  lg: 16 as const,
  xl: 20 as const,
  xxl: 24 as const,
  xxxl: 32 as const,
  huge: 48 as const,
};

// ─── Border Radii ────────────────────────────────────────────────────
export const RADII = {
  sm: 8 as const,
  md: 14 as const,
  lg: 16 as const,
  xl: 20 as const,
  xxl: 24 as const,
  full: 9999 as const,
};

// ─── Typography ──────────────────────────────────────────────────────
export const TYPOGRAPHY: Record<string, TextStyle> = {
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  bodyBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  bodySmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    lineHeight: 22,
  },
  h2: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 20,
    lineHeight: 26,
  },
  h1: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
    lineHeight: 30,
  },
  button: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  numericLarge: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
  },
  numericMedium: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
};

// ─── Shadows ─────────────────────────────────────────────────────────
export const SHADOWS: Record<string, ViewStyle> = {
  card: {
    shadowColor: 'rgba(17,24,39,1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMedium: {
    shadowColor: 'rgba(17,24,39,1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  elevated: {
    shadowColor: 'rgba(17,24,39,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  button: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
};

// ─── Hit Slop ────────────────────────────────────────────────────────
export const HIT_SLOP = {
  standard: { top: 8, bottom: 8, left: 8, right: 8 },
  large: { top: 12, bottom: 12, left: 12, right: 12 },
};

export const MIN_TOUCH_SIZE = 44;
