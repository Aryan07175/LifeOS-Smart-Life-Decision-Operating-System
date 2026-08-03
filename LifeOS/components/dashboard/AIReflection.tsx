/**
 * AIReflection — Premium AI insight card on the dashboard.
 *
 * Shows the top user insight from the AI intelligence pipeline.
 * When no insights exist, shows a motivational quote with context.
 *
 * Design: Indigo tinted card, sparkles indicator, subtle left accent bar.
 * Communicates: "AI has analyzed your history and found something for you."
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonBlock, FadeInView } from '@/components/ui';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/utils/designTokens';
import { getRandomQuote } from '@/utils/constants';

type AIReflectionProps = {
    insight: any | null;
    isLoading: boolean;
};

const EmptyContent: React.FC = () => {
    const quote = getRandomQuote();
    return (
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.lg }}>
                <View
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                </View>
                <View>
                    <Text style={[TYPOGRAPHY.label, { color: COLORS.primary }]}>AI Advisor</Text>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.primary + 'AA' }}>
                        Waiting for more decisions
                    </Text>
                </View>
            </View>

            {/* Quote with left accent */}
            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <View style={{ width: 2.5, borderRadius: 2, backgroundColor: COLORS.primary + '40', minHeight: 50 }} />
                <Text
                    style={{
                        flex: 1,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 15,
                        color: COLORS.textPrimary,
                        lineHeight: 24,
                        fontStyle: 'italic',
                    }}
                >
                    "{quote}"
                </Text>
            </View>

            <Text
                style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: COLORS.primary + '99',
                    marginTop: SPACING.md,
                    lineHeight: 18,
                }}
            >
                Track decisions and outcomes to receive personalized AI insights.
            </Text>
        </View>
    );
};

export const AIReflection: React.FC<AIReflectionProps> = ({ insight, isLoading }) => {
    if (isLoading) {
        return (
            <View style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl }}>
                <SkeletonBlock width="100%" height={140} radius={RADII.xl} />
            </View>
        );
    }

    const description = insight?.description ?? null;
    const dataPoints = insight?.dataPoints ?? null;
    const title = insight?.title ?? null;

    return (
        <FadeInView delay={200} style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl }}>
            <View
                style={{
                    backgroundColor: COLORS.primarySurface,
                    borderRadius: RADII.xl,
                    padding: SPACING.xl,
                    borderWidth: 1,
                    borderColor: COLORS.primary + '1A',
                }}
            >
                {description ? (
                    <View>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md }}>
                            <View
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: COLORS.primary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={[TYPOGRAPHY.label, { color: COLORS.primary }]}>AI Insight</Text>
                                {title && (
                                    <Text
                                        style={{
                                            fontFamily: 'Inter_600SemiBold',
                                            fontSize: 11,
                                            color: COLORS.primary + 'BB',
                                        }}
                                        numberOfLines={1}
                                    >
                                        {title}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Insight body */}
                        <Text
                            style={{
                                fontFamily: 'Inter_500Medium',
                                fontSize: 14,
                                color: COLORS.textPrimary,
                                lineHeight: 22,
                                marginBottom: dataPoints != null ? SPACING.md : 0,
                            }}
                        >
                            {description}
                        </Text>

                        {/* Data points badge */}
                        {dataPoints != null && (
                            <View
                                style={{
                                    alignSelf: 'flex-start',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5,
                                    backgroundColor: COLORS.primary + '14',
                                    borderRadius: RADII.full,
                                    paddingHorizontal: SPACING.md,
                                    paddingVertical: 5,
                                }}
                            >
                                <Ionicons name="bar-chart-outline" size={11} color={COLORS.primary} />
                                <Text
                                    style={{
                                        fontFamily: 'Inter_600SemiBold',
                                        fontSize: 11,
                                        color: COLORS.primary,
                                    }}
                                >
                                    Based on {dataPoints} data points
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <EmptyContent />
                )}
            </View>
        </FadeInView>
    );
};
