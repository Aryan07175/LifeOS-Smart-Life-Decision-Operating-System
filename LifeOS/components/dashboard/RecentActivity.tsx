/**
 * RecentActivity — Premium decision feed on the dashboard.
 *
 * Design: Cards instead of flat list rows. Each card has a left
 * category accent bar, icon, title, status, and time metadata.
 * Staggered FadeInView entrance animation.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SkeletonBlock, FadeInView, PressableScale } from '@/components/ui';
import {
    getCategoryIconOutline,
    getCategoryColor,
    getCategoryBg,
    getStatusColor,
    timeAgo,
} from '@/utils/helpers';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import type { Decision } from '@/services/dashboardService';

// ─── Single Activity Item ─────────────────────────────────────────────────────

const ActivityItem: React.FC<{ decision: Decision; index: number }> = memo(({ decision, index }) => {
    const router = useRouter();
    const catColor = getCategoryColor(decision.category);
    const catBg = getCategoryBg(decision.category);
    const statusColor = getStatusColor(decision.status);

    return (
        <FadeInView delay={index * 50}>
            <PressableScale
                onPress={() => router.push(`/(tabs)/decisions/${decision.id}`)}
                style={{
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.lg,
                    marginBottom: SPACING.sm,
                    overflow: 'hidden',
                    ...SHADOWS.card,
                }}
                accessibilityLabel={`View decision: ${decision.title}`}
                accessibilityRole="button"
            >
                {/* Category accent bar */}
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        backgroundColor: catColor,
                    }}
                />

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: SPACING.md,
                        paddingLeft: SPACING.xl,
                        paddingRight: SPACING.lg,
                    }}
                >
                    {/* Category icon */}
                    <View
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: catBg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: SPACING.md,
                        }}
                    >
                        <Ionicons name={getCategoryIconOutline(decision.category)} size={18} color={catColor} />
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontFamily: 'Inter_600SemiBold',
                                fontSize: 14,
                                color: COLORS.textPrimary,
                                lineHeight: 20,
                            }}
                            numberOfLines={1}
                        >
                            {decision.title}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: statusColor }} />
                            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                                {timeAgo(decision.updatedAt)}
                            </Text>
                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.outlineVariant }}>
                                ·
                            </Text>
                            <Text
                                style={{
                                    fontFamily: 'Inter_500Medium',
                                    fontSize: 11,
                                    color: catColor,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {decision.category.replace(/_/g, ' ')}
                            </Text>
                        </View>
                    </View>

                    <Ionicons name="chevron-forward" size={16} color={COLORS.outlineVariant} />
                </View>
            </PressableScale>
        </FadeInView>
    );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyDecisions: React.FC<{ onNew: () => void }> = ({ onNew }) => (
    <View
        style={{
            backgroundColor: COLORS.surfaceLowest,
            borderRadius: RADII.xl,
            padding: SPACING.xxxl,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.surfaceDim,
            borderStyle: 'dashed',
        }}
    >
        <View
            style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: COLORS.primarySurface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.md,
            }}
        >
            <Ionicons name="layers-outline" size={24} color={COLORS.primary} />
        </View>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: COLORS.textPrimary, marginBottom: 4 }}>
            No decisions yet
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
            Your first decision is the beginning of your personal decision history.
        </Text>
        <PressableScale
            onPress={onNew}
            style={{
                marginTop: SPACING.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
            }}
        >
            <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: COLORS.primary }}>
                Record First Decision
            </Text>
        </PressableScale>
    </View>
);

// ─── Section Wrapper ──────────────────────────────────────────────────────────

type RecentActivityProps = {
    decisions: Decision[];
    isLoading: boolean;
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ decisions, isLoading }) => {
    const router = useRouter();

    return (
        <View style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxxl }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: SPACING.md,
                }}
            >
                <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted }]}>Recent Decisions</Text>
                {decisions.length > 0 && (
                    <PressableScale
                        onPress={() => router.push('/(tabs)/decisions')}
                        accessibilityLabel="View all decisions"
                        accessibilityRole="button"
                    >
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: COLORS.primary }}>
                            View all
                        </Text>
                    </PressableScale>
                )}
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={{ gap: SPACING.sm }}>
                    {[0, 1, 2].map((i) => (
                        <SkeletonBlock key={i} width="100%" height={66} radius={RADII.lg} />
                    ))}
                </View>
            ) : decisions.length === 0 ? (
                <EmptyDecisions onNew={() => router.push('/(tabs)/decisions/new')} />
            ) : (
                <View>
                    {decisions.map((d, i) => (
                        <ActivityItem key={d.id} decision={d} index={i} />
                    ))}
                </View>
            )}
        </View>
    );
};
