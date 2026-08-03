/**
 * Analytics Screen — Decision intelligence dashboard.
 *
 * Hierarchy per blueprint:
 *  1. Page header (title + subtitle)
 *  2. KPI Summary Cards (4, 2-col grid)
 *  3. Category Breakdown
 *  4. Satisfaction Quality Over Time
 *  5. AI Insights
 *
 * All sections animate in with staggered FadeInView.
 */

import React, { useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import {
    useAnalyticsSummary,
    useQualityOverTime,
    useInsights,
    useDismissInsight,
} from '@/hooks/useAnalytics';
import { SummaryCard, CategoryBreakdown, QualityTimeline, InsightList } from '@/components/analytics';
import { SkeletonBlock, FadeInView } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

export default function AnalyticsScreen() {
    const queryClient = useQueryClient();

    const {
        data: summary,
        isLoading: summaryLoading,
        isError: summaryError,
        refetch: refetchSummary,
    } = useAnalyticsSummary();
    const { data: timeline = [], isLoading: timelineLoading } = useQualityOverTime();
    const { data: insights = [], isLoading: insightsLoading } = useInsights();
    const dismissMutation = useDismissInsight();

    const onRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }, [queryClient]);

    const handleDismiss = (id: string) => dismissMutation.mutate(id);

    // ── Error state ──
    if (summaryError && !summaryLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: SPACING.xxl,
                    }}
                >
                    <View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: COLORS.dangerBg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: SPACING.lg,
                        }}
                    >
                        <Ionicons name="analytics-outline" size={28} color={COLORS.danger} />
                    </View>
                    <Text style={[TYPOGRAPHY.heading, { color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: 'center' }]}>
                        Could not load analytics
                    </Text>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl }]}>
                        Check your connection and try again.
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetchSummary()}
                        style={{
                            backgroundColor: COLORS.primary,
                            borderRadius: RADII.md,
                            paddingHorizontal: SPACING.xxl,
                            paddingVertical: SPACING.md,
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: COLORS.textOnPrimary }}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: SPACING.xxxl }}
                refreshControl={
                    <RefreshControl
                        refreshing={summaryLoading}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* ── Page Header ── */}
                <FadeInView style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.xl }}>
                    <Text
                        style={{
                            fontFamily: 'Inter_800ExtraBold',
                            fontSize: 28,
                            color: COLORS.textPrimary,
                            letterSpacing: -0.8,
                            marginBottom: 4,
                        }}
                    >
                        Analytics
                    </Text>
                    <Text style={[TYPOGRAPHY.bodyLarge, { color: COLORS.textSecondary }]}>
                        Track your decision-making patterns
                    </Text>
                </FadeInView>

                {/* ── KPI Summary Cards ── */}
                <FadeInView delay={80} style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl }}>
                    {summaryLoading ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                            {[0, 1, 2, 3].map((i) => (
                                <SkeletonBlock
                                    key={i}
                                    width="47%"
                                    height={120}
                                    radius={RADII.xl}
                                />
                            ))}
                        </View>
                    ) : summary ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
                            <SummaryCard
                                icon="checkmark-circle"
                                label="Decisions"
                                value={summary.totalDecisions}
                                color={COLORS.primary}
                                bgColor={COLORS.primarySurface}
                            />
                            <SummaryCard
                                icon="trending-up"
                                label="Avg Confidence"
                                value={
                                    summary.averageConfidence != null
                                        ? `${summary.averageConfidence.toFixed(1)}/10`
                                        : '—'
                                }
                                color={COLORS.success}
                                bgColor={COLORS.successBg}
                            />
                            <SummaryCard
                                icon="star"
                                label="Avg Satisfaction"
                                value={
                                    summary.averageSatisfaction != null
                                        ? `${summary.averageSatisfaction.toFixed(1)}/10`
                                        : '—'
                                }
                                color={COLORS.warning}
                                bgColor={COLORS.warningBg}
                            />
                            <SummaryCard
                                icon="notifications"
                                label="Pending Check-ins"
                                value={summary.pendingCheckins}
                                color={COLORS.danger}
                                bgColor={COLORS.dangerBg}
                            />
                        </View>
                    ) : null}
                </FadeInView>

                {/* ── Category Breakdown ── */}
                {summary && summary.topCategories.length > 0 && (
                    <FadeInView delay={160} style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl }}>
                        <CategoryBreakdown data={summary.topCategories} />
                    </FadeInView>
                )}

                {/* ── Quality Over Time ── */}
                <FadeInView delay={240} style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl }}>
                    {timelineLoading ? (
                        <SkeletonBlock width="100%" height={190} radius={RADII.xl} />
                    ) : (
                        <QualityTimeline data={timeline} />
                    )}
                </FadeInView>

                {/* ── AI Insights ── */}
                <FadeInView delay={320} style={{ paddingHorizontal: SPACING.xxl }}>
                    <InsightList
                        insights={insights}
                        onDismiss={handleDismiss}
                        isLoading={insightsLoading}
                    />
                </FadeInView>
            </ScrollView>
        </SafeAreaView>
    );
}
