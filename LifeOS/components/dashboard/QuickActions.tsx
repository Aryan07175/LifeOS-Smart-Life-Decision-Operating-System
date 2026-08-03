/**
 * QuickActions — Primary CTAs: "New Decision" and "Ask AI".
 * Uses PressableScale for spring animation on press.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale, FadeInView } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS } from '@/utils/designTokens';

type QuickActionsProps = {
    onNewDecision: () => void;
    onAskAI: () => void;
};

export const QuickActions: React.FC<QuickActionsProps> = ({ onNewDecision, onAskAI }) => (
    <FadeInView delay={150} style={{ marginBottom: SPACING.xxl }}>
        <View style={{ flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.xxl }}>
            {/* New Decision — Primary CTA */}
            <PressableScale
                onPress={onNewDecision}
                style={{ flex: 1 }}
                accessibilityLabel="Create new decision"
                accessibilityRole="button"
            >
                <LinearGradient
                    colors={['#3525CD', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: RADII.md,
                        paddingVertical: 14,
                        paddingHorizontal: SPACING.xl,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: SPACING.sm,
                        ...SHADOWS.button,
                    }}
                >
                    <View
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                    </View>
                    <Text
                        style={{
                            fontFamily: 'Inter_700Bold',
                            fontSize: 15,
                            color: '#FFFFFF',
                        }}
                    >
                        New Decision
                    </Text>
                </LinearGradient>
            </PressableScale>

            {/* Ask AI — Secondary CTA */}
            <PressableScale
                onPress={onAskAI}
                accessibilityLabel="Ask AI advisor"
                accessibilityRole="button"
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                        paddingVertical: 14,
                        paddingHorizontal: SPACING.xl,
                        borderRadius: RADII.md,
                        backgroundColor: COLORS.surfaceLowest,
                        borderWidth: 1.5,
                        borderColor: COLORS.outlineVariant,
                        ...SHADOWS.card,
                    }}
                >
                    <View
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: COLORS.primarySurface,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                    </View>
                    <Text
                        style={{
                            fontFamily: 'Inter_700Bold',
                            fontSize: 15,
                            color: COLORS.textPrimary,
                        }}
                    >
                        Ask AI
                    </Text>
                </View>
            </PressableScale>
        </View>
    </FadeInView>
);
