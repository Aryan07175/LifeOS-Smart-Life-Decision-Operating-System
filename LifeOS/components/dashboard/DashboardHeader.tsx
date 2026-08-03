/**
 * DashboardHeader — Premium app header with logo and profile avatar.
 * Features a thin top border for depth and a refined wordmark.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/ui';
import { COLORS, SPACING, SHADOWS } from '@/utils/designTokens';

type DashboardHeaderProps = {
    firstName?: string;
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ firstName }) => {
    const router = useRouter();
    const initial = firstName ? firstName.charAt(0).toUpperCase() : '?';

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: SPACING.xxl,
                paddingTop: SPACING.md,
                paddingBottom: SPACING.lg,
                backgroundColor: COLORS.surface,
            }}
        >
            {/* Wordmark */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="layers" size={15} color="#FFFFFF" />
                </View>
                <Text
                    style={{
                        fontFamily: 'Inter_800ExtraBold',
                        fontSize: 18,
                        color: COLORS.textPrimary,
                        letterSpacing: -0.5,
                    }}
                >
                    LifeOS
                </Text>
            </View>

            {/* Profile avatar */}
            <PressableScale
                onPress={() => router.push('/(tabs)/profile')}
                accessibilityLabel="View profile"
                accessibilityRole="button"
            >
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: COLORS.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...SHADOWS.card,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: 'Inter_700Bold',
                            fontSize: 14,
                            color: COLORS.textOnPrimary,
                            letterSpacing: 0.5,
                        }}
                    >
                        {initial}
                    </Text>
                </View>
            </PressableScale>
        </View>
    );
};
