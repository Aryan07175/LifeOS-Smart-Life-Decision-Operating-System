/**
 * Greeting — Premium time-aware greeting with animated entrance.
 * Communicates the user's current standing: decisions pending,
 * and a motivating subtitle tied to their data.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SkeletonBlock, FadeInView } from '@/components/ui';
import { getGreeting } from '@/utils/helpers';
import { COLORS, SPACING, TYPOGRAPHY } from '@/utils/designTokens';

type GreetingProps = {
    firstName?: string;
    isLoading: boolean;
    pendingCount?: number;
};

export const Greeting: React.FC<GreetingProps> = ({ firstName, isLoading, pendingCount = 0 }) => {
    if (isLoading) {
        return (
            <View style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xxl }}>
                <SkeletonBlock width={240} height={32} style={{ marginBottom: SPACING.sm }} />
                <SkeletonBlock width={180} height={16} />
            </View>
        );
    }

    const subtitle = pendingCount > 0
        ? `You have ${pendingCount} check-in${pendingCount > 1 ? 's' : ''} waiting for your reflection.`
        : 'All caught up. Ready to track a new decision?';

    return (
        <FadeInView delay={50} style={{ paddingHorizontal: SPACING.xxl, marginBottom: SPACING.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.xs }}>
                <Text
                    style={{
                        fontFamily: 'Inter_800ExtraBold',
                        fontSize: 28,
                        color: COLORS.textPrimary,
                        letterSpacing: -0.8,
                        lineHeight: 34,
                    }}
                >
                    {getGreeting()}, {firstName ?? 'there'}.
                </Text>
            </View>
            <Text
                style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 15,
                    color: COLORS.textSecondary,
                    lineHeight: 22,
                }}
            >
                {subtitle}
            </Text>
        </FadeInView>
    );
};
