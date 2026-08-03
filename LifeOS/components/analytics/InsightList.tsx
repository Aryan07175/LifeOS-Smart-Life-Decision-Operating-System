/**
 * InsightList — Premium AI insights list with dismiss animation.
 *
 * Each insight card has:
 *  • Significance indicator (dots or bar)
 *  • Title + description
 *  • Action suggestion (if available)
 *  • Dismiss button (with slide-out animation)
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonBlock, FadeInView } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import type { UserInsight } from '@/services/analyticsService';

// ─── Single insight card with dismiss animation ────────────────────────────────

const InsightCard: React.FC<{
    insight: UserInsight;
    index: number;
    onDismiss: (id: string) => void;
}> = ({ insight, index, onDismiss }) => {
    const slideAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handleDismiss = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start(() => onDismiss(insight.id));
    }, [insight.id, onDismiss, slideAnim, opacityAnim]);

    // Significance score → color
    const sig = insight.significance ?? 5;
    const sigColor = sig >= 8 ? COLORS.danger : sig >= 6 ? COLORS.warning : COLORS.primary;

    return (
        <FadeInView delay={index * 80}>
            <Animated.View
                style={{
                    opacity: opacityAnim,
                    transform: [
                        {
                            translateX: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [40, 0],
                            }),
                        },
                    ],
                }}
            >
                <View
                    style={{
                        backgroundColor: COLORS.surfaceLowest,
                        borderRadius: RADII.xl,
                        padding: SPACING.xl,
                        marginBottom: SPACING.md,
                        ...SHADOWS.cardMedium,
                        borderLeftWidth: 3,
                        borderLeftColor: sigColor,
                    }}
                >
                    {/* Top row: icon + title + dismiss */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: SPACING.md,
                            marginBottom: SPACING.sm,
                        }}
                    >
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: sigColor + '14',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Ionicons name="bulb-outline" size={16} color={sigColor} />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontFamily: 'Inter_700Bold',
                                    fontSize: 14,
                                    color: COLORS.textPrimary,
                                    lineHeight: 20,
                                    marginBottom: 4,
                                }}
                            >
                                {insight.title}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: 'Inter_400Regular',
                                    fontSize: 13,
                                    color: COLORS.textSecondary,
                                    lineHeight: 19,
                                }}
                                numberOfLines={3}
                            >
                                {insight.description}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleDismiss}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            accessibilityLabel="Dismiss insight"
                            accessibilityRole="button"
                        >
                            <Ionicons name="close" size={18} color={COLORS.outlineVariant} />
                        </TouchableOpacity>
                    </View>

                    {/* Action suggestion */}
                    {insight.actionSuggestion && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 8,
                                marginTop: SPACING.sm,
                                backgroundColor: sigColor + '08',
                                borderRadius: RADII.sm,
                                padding: SPACING.md,
                            }}
                        >
                            <Ionicons name="arrow-forward-circle-outline" size={15} color={sigColor} style={{ marginTop: 1 }} />
                            <Text
                                style={{
                                    flex: 1,
                                    fontFamily: 'Inter_500Medium',
                                    fontSize: 12,
                                    color: sigColor,
                                    lineHeight: 18,
                                }}
                            >
                                {insight.actionSuggestion}
                            </Text>
                        </View>
                    )}

                    {/* Significance indicator */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 3,
                            marginTop: SPACING.md,
                        }}
                    >
                        {Array.from({ length: 10 }).map((_, i) => (
                            <View
                                key={i}
                                style={{
                                    width: 14,
                                    height: 3,
                                    borderRadius: 2,
                                    backgroundColor: i < sig ? sigColor : COLORS.surfaceDim,
                                }}
                            />
                        ))}
                        <Text
                            style={{
                                fontFamily: 'Inter_600SemiBold',
                                fontSize: 10,
                                color: COLORS.textSecondary,
                                marginLeft: 4,
                            }}
                        >
                            Significance {sig}/10
                        </Text>
                    </View>
                </View>
            </Animated.View>
        </FadeInView>
    );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

interface InsightListProps {
    insights: UserInsight[];
    onDismiss: (id: string) => void;
    isLoading: boolean;
}

const InsightList: React.FC<InsightListProps> = ({ insights, onDismiss, isLoading }) => {
    if (isLoading) {
        return (
            <View>
                <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: SPACING.md }]}>
                    AI Insights
                </Text>
                {[0, 1].map((i) => (
                    <SkeletonBlock key={i} width="100%" height={110} radius={RADII.xl} style={{ marginBottom: SPACING.md }} />
                ))}
            </View>
        );
    }

    if (insights.length === 0) {
        return (
            <View
                style={{
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.xl,
                    padding: SPACING.xxxl,
                    alignItems: 'center',
                    ...SHADOWS.card,
                }}
            >
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: COLORS.primarySurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: SPACING.md,
                    }}
                >
                    <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary, marginBottom: 6 }}>
                    No insights yet
                </Text>
                <Text
                    style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }]}
                >
                    Record more decisions and outcomes to receive personalized AI insights.
                </Text>
            </View>
        );
    }

    return (
        <View>
            <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: SPACING.md }]}>
                AI Insights
            </Text>
            {insights.map((insight, i) => (
                <InsightCard
                    key={insight.id}
                    insight={insight}
                    index={i}
                    onDismiss={onDismiss}
                />
            ))}
        </View>
    );
};

export default InsightList;
