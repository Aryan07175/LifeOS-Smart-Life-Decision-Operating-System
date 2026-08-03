/**
 * Decision List Screen
 * Search, filter, and browse all decisions with category/status filters.
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    RefreshControl,
    StatusBar,
    TextInput,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useDecisions, decisionKeys } from '@/hooks/useDecisions';
import { CATEGORY_FILTERS, STATUS_FILTERS } from '@/utils/constants';
import { DecisionCard, DecisionCardSkeleton } from '@/components/decisions';
import { EmptyState, PressableScale, FadeInView } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

export default function DecisionListScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const params = {
        page: 1,
        limit: 50,
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {}),
        sortBy: 'decisionDate' as const,
        sortOrder: 'desc' as const,
    };

    const { data, isLoading, isRefetching } = useDecisions(params);

    const decisions = data?.data ?? [];
    const filteredDecisions = searchQuery
        ? decisions.filter(
            (d) =>
                d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : decisions;

    const onRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: decisionKeys.lists() });
    }, [queryClient]);

    const handleNew = () => router.push('/(tabs)/decisions/new');
    const handleDetail = (id: string) => router.push(`/(tabs)/decisions/${id}`);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* ── Header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.lg }}>
                <View>
                    <Text
                        style={{
                            fontFamily: 'Inter_800ExtraBold',
                            fontSize: 28,
                            color: COLORS.textPrimary,
                            letterSpacing: -0.8,
                            lineHeight: 34,
                        }}
                    >
                        Decisions
                    </Text>
                    {decisions.length > 0 && (
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
                            {decisions.length} total
                        </Text>
                    )}
                </View>
                <PressableScale
                    onPress={handleNew}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...SHADOWS.button,
                    }}
                    accessibilityLabel="New decision"
                    accessibilityRole="button"
                >
                    <Ionicons name="add" size={22} color="#FFFFFF" />
                </PressableScale>
            </View>

            {/* ── Search Bar ── */}
            <View style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.md, paddingHorizontal: SPACING.md, height: 46, borderWidth: 1.5, borderColor: COLORS.outlineVariant }}>
                    <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search decisions..."
                        placeholderTextColor="#9CA3AF"
                        style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textPrimary, marginLeft: 10, height: 48 }}
                    />
                    {searchQuery.length > 0 && (
                        <PressableScale onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.outlineVariant} />
                        </PressableScale>
                    )}
                </View>
            </View>

            {/* ── Category Filters ── */}
            <FlatList
                horizontal
                data={CATEGORY_FILTERS}
                keyExtractor={(item) => item.key}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SPACING.xl, gap: SPACING.sm }}
                style={{ maxHeight: 44, flexGrow: 0, marginBottom: SPACING.md }}
                renderItem={({ item: cat }) => {
                    const isActive = selectedCategory === cat.key;
                    return (
                        <PressableScale
                            key={cat.key}
                            onPress={() => setSelectedCategory(isActive ? '' : cat.key)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 9, borderRadius: RADII.md, backgroundColor: isActive ? COLORS.primary : COLORS.surfaceLowest, borderWidth: 1, borderColor: isActive ? COLORS.primary : COLORS.surfaceDim }}
                        >
                            <Ionicons name={cat.icon} size={15} color={isActive ? COLORS.textOnPrimary : COLORS.textSecondary} />
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: isActive ? COLORS.textOnPrimary : COLORS.textBody }}>
                                {cat.label}
                            </Text>
                        </PressableScale>
                    );
                }}
            />

            {/* ── Status Filters + Count ── */}
            <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.xl }}>
                {STATUS_FILTERS.map((sf) => {
                    const isActive = selectedStatus === sf.key;
                    return (
                        <PressableScale
                            key={sf.key}
                            onPress={() => setSelectedStatus(isActive ? '' : sf.key)}
                            style={{ paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADII.full, backgroundColor: isActive ? COLORS.textPrimary : 'transparent', borderWidth: isActive ? 0 : 1, borderColor: COLORS.surfaceDim }}
                        >
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: isActive ? COLORS.textOnPrimary : COLORS.textSecondary }}>
                                {sf.label}
                            </Text>
                        </PressableScale>
                    );
                })}
                {!isLoading && (
                    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Text style={[TYPOGRAPHY.bodySmall, { color: '#9CA3AF' }]}>
                            {filteredDecisions.length} decision{filteredDecisions.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Decision List ── */}
            <View style={{ flex: 1 }}>
                {isLoading ? (
                    <FlatList
                        data={[1, 2, 3, 4]}
                        keyExtractor={(i) => String(i)}
                        renderItem={() => <DecisionCardSkeleton />}
                        showsVerticalScrollIndicator={false}
                    />
                ) : filteredDecisions.length === 0 ? (
                    <EmptyState icon="scale-outline" title="No decisions yet" subtitle="Start tracking your life decisions to unlock AI-powered insights and patterns." ctaLabel="Create Your First Decision" onCta={handleNew} />
                ) : (
                    <FlatList
                        data={filteredDecisions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <DecisionCard decision={item} onPress={() => handleDetail(item.id)} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
                    />
                )}
            </View>

            {/* ── FAB ── */}
            <PressableScale onPress={handleNew} style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 10 }}>
                <LinearGradient colors={['#3525CD', COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', ...SHADOWS.fab }}>
                    <Ionicons name="add" size={28} color={COLORS.textOnPrimary} />
                </LinearGradient>
            </PressableScale>
        </SafeAreaView>
    );
}
