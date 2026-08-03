/**
 * Decision Detail Screen
 *
 * Thin compositor: fetches decision & outcomes, manages tab state,
 * delegates rendering to InfoCard, OutcomeTimelineItem, ConfidenceRing, etc.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDecision, useDecisionOutcomes, useDeleteDecision, useUpdateDecision } from '@/hooks/useDecisions';

import { ConfidenceRing, SkeletonBlock, PressableScale } from '@/components/ui';
import {
    InfoCard,
    OutcomeTimelineItem,
    DetailSkeleton,
} from '@/components/decisions';
import {
    getCategoryColor,
    getCategoryBg,
    getStatusColor,
    getStatusLabel,
    getConfidenceText,
} from '@/utils/helpers';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

export default function DecisionDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<'context' | 'outcomes'>('context');
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 20 });
    const kebabRef = useRef<View>(null);

    const { data: decision, isLoading, isError, refetch } = useDecision(id!);
    const { data: outcomes = [], isLoading: outcomesLoading } = useDecisionOutcomes(id!);
    const deleteMutation = useDeleteDecision();
    const updateMutation = useUpdateDecision();

    const measureKebab = useCallback(() => {
        kebabRef.current?.measureInWindow((x, y, width, height) => {
            setMenuPosition({ top: y + height + 4, right: 20 });
        });
    }, []);

    const handleDelete = () => {
        Alert.alert(
            'Delete Decision',
            'This will archive this decision. You can still view it later.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteMutation.mutate(id!, { onSuccess: () => router.back() });
                    },
                },
            ],
        );
    };

    const handleCheckin = () => {
        setShowMenu(false);
        router.push(`/(tabs)/decisions/checkin?id=${id}`);
    };

    const handleEdit = () => {
        setShowMenu(false);
        router.push(`/(tabs)/decisions/new?editId=${id}`);
    };

    const handleStatusChange = (newStatus: string) => {
        setShowMenu(false);
        const labels: Record<string, string> = {
            archived: 'Archive',
            active: 'Reactivate',
        };
        Alert.alert(
            `${labels[newStatus] || 'Update'} Decision`,
            `Are you sure you want to ${(labels[newStatus] || newStatus).toLowerCase()} this decision?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: labels[newStatus] || 'Confirm',
                    onPress: () => {
                        updateMutation.mutate({ id: id!, payload: { status: newStatus } });
                    },
                },
            ],
        );
    };

    const handleAnalyzeAI = () => {
        setShowMenu(false);
        router.push(`/(tabs)/ai?decisionId=${id}`);
    };

    // ── Error state ──
    if (isError && !isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl }}>
                    <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
                    <Text style={[TYPOGRAPHY.heading, { color: COLORS.textPrimary, marginTop: SPACING.md, textAlign: 'center' }]}>
                        Failed to load decision
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={{ marginTop: SPACING.lg, backgroundColor: COLORS.primary, borderRadius: RADII.md, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md }}
                    >
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: COLORS.textOnPrimary }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Loading state ──
    if (isLoading || !decision) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ padding: SPACING.sm }}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[TYPOGRAPHY.heading, { flex: 1, color: COLORS.textPrimary, textAlign: 'center' }]}>Decision Detail</Text>
                    <View style={{ width: 40 }} />
                </View>
                <DetailSkeleton />
            </SafeAreaView>
        );
    }

    const catColor = getCategoryColor(decision.category);
    const catBg = getCategoryBg(decision.category);
    const statusColor = getStatusColor(decision.status);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* ── Header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: SPACING.sm }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[TYPOGRAPHY.heading, { color: COLORS.textPrimary }]}>Decision Detail</Text>
                <TouchableOpacity
                    ref={kebabRef}
                    onPress={() => { measureKebab(); setShowMenu(!showMenu); }}
                    style={{ padding: SPACING.sm }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* ── Dropdown Menu (Modal overlay) ── */}
            <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
                <Pressable style={{ flex: 1 }} onPress={() => setShowMenu(false)}>
                    <View
                        style={{
                            position: 'absolute',
                            top: menuPosition.top,
                            right: menuPosition.right,
                            backgroundColor: COLORS.surfaceLowest,
                            borderRadius: RADII.md,
                            padding: 6,
                            minWidth: 190,
                            ...SHADOWS.fab,
                        }}
                    >
                        <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10 }}>
                            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary }}>Edit Decision</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCheckin} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10 }}>
                            <Ionicons name="checkbox-outline" size={18} color={COLORS.success} />
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary }}>Record Check-in</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setShowMenu(false); handleAnalyzeAI(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10 }}>
                            <Ionicons name="sparkles-outline" size={18} color="#7C3AED" />
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary }}>Analyze with AI</Text>
                        </TouchableOpacity>
                        {decision.status === 'active' ? (
                            <TouchableOpacity onPress={() => handleStatusChange('archived')} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10 }}>
                                <Ionicons name="archive-outline" size={18} color={COLORS.warning} />
                                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary }}>Archive</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => handleStatusChange('active')} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10 }}>
                                <Ionicons name="refresh-outline" size={18} color={COLORS.success} />
                                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary }}>Reactivate</Text>
                            </TouchableOpacity>
                        )}
                        <View style={{ height: 1, backgroundColor: COLORS.surfaceLow, marginHorizontal: SPACING.sm, marginVertical: SPACING.xs }} />
                        <TouchableOpacity onPress={() => { setShowMenu(false); handleDelete(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10 }}>
                            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.danger }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.xxl }} onScrollBeginDrag={() => showMenu && setShowMenu(false)} scrollEnabled={true}>
                {/* ── Badges ── */}
                <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.xxl, marginBottom: SPACING.md, marginTop: SPACING.xs }}>
                    <View style={{ backgroundColor: catBg, borderRadius: RADII.sm, paddingHorizontal: SPACING.md, paddingVertical: 5 }}>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: catColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{decision.category}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: statusColor + '18', borderRadius: RADII.sm, paddingHorizontal: SPACING.md, paddingVertical: 5 }}>
                        <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: statusColor }} />
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: statusColor, textTransform: 'uppercase', letterSpacing: 0.8 }}>{getStatusLabel(decision.status)}</Text>
                    </View>
                </View>

                {/* ── Title ── */}
                <View style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xl }}>
                    <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 28, color: COLORS.textPrimary, letterSpacing: -1, lineHeight: 34 }} numberOfLines={3}>{decision.title}</Text>
                </View>

                {/* ── Segmented Control ── */}
                <View style={{ flexDirection: 'row', marginHorizontal: SPACING.xxl, marginBottom: SPACING.xxl, borderRadius: RADII.md, backgroundColor: COLORS.surfaceDim, padding: 4 }}>
                    {(['context', 'outcomes'] as const).map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: isActive ? COLORS.surfaceLowest : 'transparent',
                                    ...(isActive ? { shadowColor: 'rgba(0,0,0,0.5)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } : {}),
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ fontFamily: isActive ? 'Inter_700Bold' : 'Inter_500Medium', fontSize: 14, color: isActive ? COLORS.textPrimary : COLORS.textSecondary }}>
                                    {tab === 'context' ? 'Context' : 'Outcomes'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── Tab Content ── */}
                {activeTab === 'context' ? (
                    <View style={{ paddingHorizontal: SPACING.xxl, gap: SPACING.lg }}>
                        {/* Confidence Card */}
                        <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.xl, padding: SPACING.xxl, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...SHADOWS.card }}>
                            <View style={{ flex: 1, marginRight: SPACING.lg }}>
                                <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted, marginBottom: 6 }]}>Decision Confidence</Text>
                                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: COLORS.textPrimary, lineHeight: 22 }}>{getConfidenceText(decision.confidenceLevel)}</Text>
                            </View>
                            <ConfidenceRing value={decision.confidenceLevel} />
                        </View>

                        {decision.description ? <InfoCard icon="document-text-outline" label="Description" content={decision.description} /> : null}
                        {decision.reasoningProcess ? <InfoCard icon="bulb-outline" label="Reasoning" content={decision.reasoningProcess} /> : null}
                        {decision.context ? <InfoCard icon="information-circle-outline" label="Context" content={decision.context} /> : null}

                        {/* Expected Outcomes / Metrics */}
                        {decision.expectedOutcomes && decision.expectedOutcomes.length > 0 ? (
                            <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.xl, padding: SPACING.xl, ...SHADOWS.card }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg }}>
                                    <Ionicons name="stats-chart-outline" size={16} color={COLORS.primary} />
                                    <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>Metrics</Text>
                                </View>
                                {decision.expectedOutcomes.map((eo: any, i: number) => (
                                    <View key={i} style={{ marginBottom: i < decision.expectedOutcomes!.length - 1 ? SPACING.lg : 0 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.textBody, textTransform: 'capitalize' }} numberOfLines={1}>{eo.outcome || eo.metric || `Metric ${i + 1}`}</Text>
                                            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: COLORS.textPrimary }}>{eo.targetValue != null ? eo.targetValue : `${eo.importance ?? 0}/5`}</Text>
                                        </View>
                                        <View style={{ height: 6, backgroundColor: COLORS.surfaceDim, borderRadius: 3 }}>
                                            <View style={{ height: 6, borderRadius: 3, backgroundColor: COLORS.primary, width: `${Math.min(((eo.importance ?? 3) / 5) * 100, 100)}%` }} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : null}

                        {/* Alternatives */}
                        {decision.alternativesConsidered && decision.alternativesConsidered.length > 0 ? (
                            <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.xl, padding: SPACING.xl, ...SHADOWS.card }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }}>
                                    <Ionicons name="git-branch-outline" size={16} color={COLORS.primary} />
                                    <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>Alternatives</Text>
                                </View>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                                    {decision.alternativesConsidered.map((alt: any, i: number) => (
                                        <View key={i} style={{ backgroundColor: COLORS.surfaceLow, borderRadius: 10, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
                                            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textBody }}>{alt.option}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        {/* Tags */}
                        {decision.tags && decision.tags.length > 0 ? (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                                {decision.tags.map((tag: string, i: number) => (
                                    <View key={i} style={{ backgroundColor: COLORS.primarySurface, borderRadius: RADII.sm, paddingHorizontal: SPACING.md, paddingVertical: 5 }}>
                                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.primary }}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>
                ) : (
                    /* ── Outcomes Tab ── */
                    <View style={{ paddingHorizontal: SPACING.xxl }}>
                        {outcomesLoading ? (
                            <View style={{ gap: SPACING.md }}>
                                {[1, 2, 3].map((i) => (
                                    <SkeletonBlock key={i} width="100%" height={100} radius={RADII.lg} />
                                ))}
                            </View>
                        ) : outcomes.length === 0 ? (
                            <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.xl, padding: SPACING.xxxl, alignItems: 'center' }}>
                                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surfaceLow, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md }}>
                                    <Ionicons name="time-outline" size={28} color={COLORS.outlineVariant} />
                                </View>
                                <Text style={[TYPOGRAPHY.heading, { color: COLORS.textPrimary, marginBottom: 6 }]}>No outcomes yet</Text>
                                <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                                    Check-in outcomes will appear here once you record them.
                                </Text>
                            </View>
                        ) : (
                            outcomes.map((outcome, i) => (
                                <OutcomeTimelineItem key={outcome.id} outcome={outcome} isLast={i === outcomes.length - 1} />
                            ))
                        )}
                    </View>
                )}

                {/* ── Bottom CTAs ── */}
                <View style={{ paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl, gap: SPACING.md }}>
                {decision.status === 'active' && (
                    <PressableScale onPress={handleCheckin} accessibilityLabel="Record check-in" accessibilityRole="button">
                        <LinearGradient
                            colors={['#3525CD', COLORS.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: SPACING.sm,
                                paddingVertical: 16,
                                borderRadius: RADII.md,
                                ...SHADOWS.button,
                            }}
                        >
                            <Ionicons name="checkbox-outline" size={18} color={COLORS.textOnPrimary} />
                            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: COLORS.textOnPrimary }}>Record Check-in</Text>
                        </LinearGradient>
                    </PressableScale>
                )}
                <PressableScale onPress={handleAnalyzeAI} accessibilityLabel="Analyze with AI" accessibilityRole="button">
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: SPACING.sm,
                        paddingVertical: 16,
                        borderRadius: RADII.md,
                        backgroundColor: COLORS.surfaceLowest,
                        borderWidth: 1.5,
                        borderColor: COLORS.outlineVariant,
                        ...SHADOWS.card,
                    }}>
                        <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: COLORS.textPrimary }}>Analyze with AI</Text>
                    </View>
                </PressableScale>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}
