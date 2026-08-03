/**
 * Dashboard Screen — Home tab
 *
 * Thin compositor: fetches data via hooks and delegates
 * rendering to dedicated section components.
 * Updated to pass pendingCount to Greeting for context-aware subtitle.
 */

import React, { useCallback } from 'react';
import { ScrollView, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import {
    useUser,
    usePendingCheckins,
    useTopInsight,
    useRecentDecisions,
    dashboardKeys,
} from '@/hooks/useDashboard';

import {
    DashboardHeader,
    Greeting,
    ActionRequired,
    QuickActions,
    AIReflection,
    RecentActivity,
} from '@/components/dashboard';
import { COLORS } from '@/utils/designTokens';

export default function DashboardScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: user, isLoading: userLoading } = useUser();
    const { data: checkins = [], isLoading: checkinsLoading } = usePendingCheckins();
    const { data: insight, isLoading: insightLoading } = useTopInsight();
    const { data: recentDecisions = [], isLoading: decisionsLoading } = useRecentDecisions();

    const isRefreshing = userLoading || checkinsLoading;

    const onRefresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.user });
        queryClient.invalidateQueries({ queryKey: dashboardKeys.pendingCheckins });
        queryClient.invalidateQueries({ queryKey: dashboardKeys.insights });
        queryClient.invalidateQueries({ queryKey: dashboardKeys.recentDecisions });
    }, [queryClient]);

    const handleNewDecision = () => router.push('/(tabs)/decisions/new');
    const handleAskAI = () => router.push('/(tabs)/ai');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            >
                <DashboardHeader firstName={user?.firstName} />
                <Greeting
                    firstName={user?.firstName}
                    isLoading={userLoading}
                    pendingCount={checkins.length}
                />
                <ActionRequired checkins={checkins} isLoading={checkinsLoading} />
                <QuickActions onNewDecision={handleNewDecision} onAskAI={handleAskAI} />
                <AIReflection insight={insight} isLoading={insightLoading} />
                <RecentActivity decisions={recentDecisions} isLoading={decisionsLoading} />
            </ScrollView>
        </SafeAreaView>
    );
}