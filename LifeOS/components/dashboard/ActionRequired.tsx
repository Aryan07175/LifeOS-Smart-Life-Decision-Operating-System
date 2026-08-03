/**
 * ActionRequired — Premium horizontal scroll of pending check-in cards.
 *
 * Each card shows:
 *  • 4px urgency accent bar (overdue=red, ≤3d=orange, ≤7d=amber, >7d=green)
 *  • Decision title (truncated)
 *  • Reminder type label
 *  • Created date
 *  • Urgency badge
 *  • Skip | Review action buttons
 *
 * Design philosophy: check-ins are the most time-sensitive user obligation.
 * This section must be immediately scannable and actionable.
 */

import React, { memo } from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SkeletonBlock, FadeInView, PressableScale } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import { useSkipCheckin } from '@/hooks/useDecisions';
import type { PendingCheckin } from '@/services/dashboardService';

const CARD_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REMINDER_LABELS: Record<string, string> = {
    '1_day':    '1-Day Check-in',
    '1_week':   '1-Week Check-in',
    '2_weeks':  '2-Week Check-in',
    '1_month':  '1-Month Check-in',
    '3_months': '3-Month Check-in',
    '6_months': '6-Month Check-in',
    '1_year':   '1-Year Check-in',
    '2_years':  '2-Year Check-in',
    target_date:'Target Date Review',
    custom:     'Custom Check-in',
};

function getUrgency(dateStr: string): { barColor: string; bgColor: string; textColor: string; label: string } {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0)  return { barColor: '#DC2626', bgColor: '#FEF2F2', textColor: '#DC2626', label: 'Overdue' };
    if (days <= 3)  return { barColor: '#EA580C', bgColor: '#FFF7ED', textColor: '#EA580C', label: `Due in ${days}d` };
    if (days <= 7)  return { barColor: '#F59E0B', bgColor: '#FFFBEB', textColor: '#D97706', label: `Due in ${days}d` };
    return          { barColor: '#059669', bgColor: '#ECFDF5', textColor: '#059669', label: `Due in ${days}d` };
}

// ─── Single Card ──────────────────────────────────────────────────────────────

const ActionCard: React.FC<{ item: PendingCheckin; index: number }> = memo(({ item, index }) => {
    const router = useRouter();
    const skipMutation = useSkipCheckin();

    const urgency = getUrgency(item.scheduledDate);
    const reminderLabel = REMINDER_LABELS[item.reminderType] ?? 'Check-in';
    const createdDate = new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const handleReview = () => router.push(`/(tabs)/decisions/checkin?id=${item.decisionId}`);
    const handleSkip = () => {
        Alert.alert('Skip Check-in', 'Skip this reminder? You can always check in manually later.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', style: 'destructive', onPress: () => skipMutation.mutate(item.id) },
        ]);
    };

    return (
        <FadeInView delay={index * 60} style={{ width: CARD_WIDTH, marginRight: SPACING.md }}>
            <View
                style={{
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.xl,
                    overflow: 'hidden',
                    ...SHADOWS.cardMedium,
                }}
            >
                {/* Urgency bar */}
                <View style={{ height: 3, backgroundColor: urgency.barColor }} />

                <View style={{ padding: SPACING.xl, gap: SPACING.lg }}>
                    {/* Reminder type pill */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: urgency.bgColor,
                                borderRadius: RADII.full,
                                paddingHorizontal: SPACING.md,
                                paddingVertical: 5,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <Ionicons name="calendar-outline" size={12} color={urgency.textColor} />
                            <Text
                                style={{
                                    fontFamily: 'Inter_700Bold',
                                    fontSize: 11,
                                    color: urgency.textColor,
                                    letterSpacing: 0.3,
                                }}
                            >
                                {reminderLabel}
                            </Text>
                        </View>
                        <Text
                            style={{
                                fontFamily: 'Inter_700Bold',
                                fontSize: 12,
                                color: urgency.textColor,
                            }}
                        >
                            {urgency.label}
                        </Text>
                    </View>

                    {/* Decision title */}
                    <View>
                        <Text
                            style={{
                                fontFamily: 'Inter_800ExtraBold',
                                fontSize: 17,
                                color: COLORS.textPrimary,
                                letterSpacing: -0.3,
                                lineHeight: 23,
                            }}
                            numberOfLines={2}
                        >
                            {item.customMessage || 'Outcome Review'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
                            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                                Created {createdDate}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: COLORS.surfaceDim }} />

                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                        <PressableScale
                            onPress={handleSkip}
                            style={{
                                flex: 1,
                                borderRadius: RADII.md,
                                paddingVertical: 11,
                                borderWidth: 1,
                                borderColor: COLORS.surfaceDim,
                                backgroundColor: COLORS.surface,
                                alignItems: 'center',
                            }}
                            accessibilityLabel="Skip check-in"
                            accessibilityRole="button"
                        >
                            <Text
                                style={{
                                    fontFamily: 'Inter_600SemiBold',
                                    fontSize: 13,
                                    color: COLORS.textSecondary,
                                }}
                            >
                                Skip
                            </Text>
                        </PressableScale>

                        <PressableScale
                            onPress={handleReview}
                            style={{ flex: 2 }}
                            accessibilityLabel="Complete check-in"
                            accessibilityRole="button"
                        >
                            <LinearGradient
                                colors={['#3525CD', COLORS.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    borderRadius: RADII.md,
                                    paddingVertical: 11,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 6,
                                }}
                            >
                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                <Text
                                    style={{
                                        fontFamily: 'Inter_700Bold',
                                        fontSize: 13,
                                        color: '#FFFFFF',
                                    }}
                                >
                                    Complete
                                </Text>
                            </LinearGradient>
                        </PressableScale>
                    </View>
                </View>
            </View>
        </FadeInView>
    );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyCheckins: React.FC = () => (
    <View style={{ paddingHorizontal: SPACING.xxl }}>
        <View
            style={{
                backgroundColor: COLORS.successBg,
                borderRadius: RADII.xl,
                padding: SPACING.xxl,
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.lg,
            }}
        >
            <View
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#065F46' }}>
                    All caught up
                </Text>
                <Text
                    style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13,
                        color: '#047857',
                        marginTop: 3,
                        lineHeight: 18,
                    }}
                >
                    No pending check-ins. New ones appear when decisions need reviewing.
                </Text>
            </View>
        </View>
    </View>
);

// ─── Loading Skeletons ────────────────────────────────────────────────────────

const LoadingSkeletons: React.FC = () => (
    <View style={{ flexDirection: 'row', paddingLeft: SPACING.xxl }}>
        <SkeletonBlock width={CARD_WIDTH} height={195} radius={RADII.xl} style={{ marginRight: SPACING.md }} />
        <SkeletonBlock width={CARD_WIDTH} height={195} radius={RADII.xl} />
    </View>
);

// ─── Section Wrapper ──────────────────────────────────────────────────────────

type ActionRequiredProps = {
    checkins: PendingCheckin[];
    isLoading: boolean;
};

export const ActionRequired: React.FC<ActionRequiredProps> = ({ checkins, isLoading }) => (
    <View style={{ marginBottom: SPACING.xl }}>
        {/* Section header */}
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: SPACING.xxl,
                marginBottom: SPACING.md,
            }}
        >
            <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted }]}>Pending Check-ins</Text>
            {checkins.length > 0 && (
                <View
                    style={{
                        backgroundColor: COLORS.dangerBg,
                        borderRadius: RADII.full,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: 'Inter_700Bold',
                            fontSize: 11,
                            color: COLORS.danger,
                        }}
                    >
                        {checkins.length} pending
                    </Text>
                </View>
            )}
        </View>

        {isLoading ? (
            <LoadingSkeletons />
        ) : checkins.length === 0 ? (
            <EmptyCheckins />
        ) : (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + SPACING.md}
                snapToAlignment="start"
                contentContainerStyle={{
                    paddingLeft: SPACING.xxl,
                    paddingRight: SPACING.md,
                    paddingBottom: 4,
                }}
            >
                {checkins.map((item, index) => (
                    <ActionCard key={item.id} item={item} index={index} />
                ))}
            </ScrollView>
        )}
    </View>
);
