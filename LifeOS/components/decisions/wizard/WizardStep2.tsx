/**
 * WizardStep2 — Context & Alternatives: background, numbered inputs.
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import type { WizardState, WizardAction } from './wizardReducer';

type Step2Props = {
    state: WizardState;
    dispatch: React.Dispatch<WizardAction>;
};

export const WizardStep2: React.FC<Step2Props> = ({ state, dispatch }) => (
    <View style={{ gap: 28 }}>
        {/* The Background */}
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="ellipse" size={10} color={COLORS.primary} />
                </View>
                <View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 17, color: COLORS.textPrimary }}>The Background</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textSecondary }}>What led you to this crossroad?</Text>
                </View>
            </View>
            <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.lg, padding: SPACING.xl, minHeight: 120, ...SHADOWS.card }}>
                <TextInput
                    value={state.context}
                    onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'context', value: v })}
                    placeholder="Describe the situation, emotions, and external factors influencing this choice..."
                    placeholderTextColor={COLORS.textMuted}
                    style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textPrimary, lineHeight: 24, textAlignVertical: 'top' }}
                    multiline
                />
            </View>
        </View>

        {/* Explore Alternatives */}
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: 14 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="git-branch-outline" size={16} color={COLORS.primary} />
                </View>
                <View>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 17, color: COLORS.textPrimary }}>Explore Alternatives</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textSecondary }}>List every path you could take.</Text>
                </View>
            </View>

            {state.alternatives.map((alt, i) => (
                <View
                    key={i}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: COLORS.surfaceLowest,
                        borderRadius: RADII.md,
                        paddingHorizontal: SPACING.md,
                        paddingVertical: 4,
                        marginBottom: SPACING.sm,
                        ...SHADOWS.card,
                    }}
                >
                    <View
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            backgroundColor: alt ? COLORS.primary : COLORS.surfaceDim,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: SPACING.md,
                        }}
                    >
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: alt ? '#FFFFFF' : COLORS.textMuted }}>
                            {i + 1}
                        </Text>
                    </View>
                    <TextInput
                        value={alt}
                        onChangeText={(v) => dispatch({ type: 'UPDATE_ALTERNATIVE', index: i, value: v })}
                        placeholder="Add a new alternative..."
                        placeholderTextColor={COLORS.textMuted}
                        style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, color: COLORS.textPrimary, paddingVertical: 12 }}
                    />
                    {alt.length > 0 && state.alternatives.length > 1 && (
                        <PressableScale onPress={() => dispatch({ type: 'REMOVE_ALTERNATIVE', index: i })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                        </PressableScale>
                    )}
                </View>
            ))}

            <PressableScale
                onPress={() => dispatch({ type: 'ADD_ALTERNATIVE' })}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: SPACING.sm,
                    paddingVertical: 14,
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.md,
                    borderWidth: 1.5,
                    borderColor: COLORS.outlineVariant,
                    borderStyle: 'dashed',
                }}
            >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.primary }}>Add Another Option</Text>
            </PressableScale>
        </View>
    </View>
);
