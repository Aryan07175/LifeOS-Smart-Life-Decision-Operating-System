/**
 * WizardStep3 — Final Calibration: metrics, date, confidence slider.
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionLabel } from './StepIndicator';
import { PressableScale } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import { MOTIVATIONAL_QUOTES } from '@/utils/constants';
import type { WizardState, WizardAction } from './wizardReducer';

type Step3Props = {
    state: WizardState;
    dispatch: React.Dispatch<WizardAction>;
};

export const WizardStep3: React.FC<Step3Props> = ({ state, dispatch }) => (
    <View style={{ gap: 28 }}>
        {/* Expected Metrics */}
        <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <SectionLabel text="Expected Metrics" />
                <TouchableOpacity onPress={() => dispatch({ type: 'ADD_METRIC' })} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="add" size={16} color={COLORS.primary} />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: COLORS.primary }}>Add Metric</Text>
                </TouchableOpacity>
            </View>

            {state.expectedOutcomes.length === 0 ? (
                <PressableScale
                    onPress={() => dispatch({ type: 'ADD_METRIC' })}
                    style={{
                        backgroundColor: COLORS.surfaceLowest,
                        borderRadius: RADII.lg,
                        padding: SPACING.xxl,
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: COLORS.outlineVariant,
                        borderStyle: 'dashed',
                    }}
                >
                    <Ionicons name="stats-chart-outline" size={28} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textSecondary }}>
                        Add expected metrics to track progress
                    </Text>
                </PressableScale>
            ) : (
                state.expectedOutcomes.map((metric, i) => (
                    <View
                        key={i}
                        style={{
                            backgroundColor: COLORS.surfaceLowest,
                            borderRadius: RADII.lg,
                            padding: SPACING.lg,
                            marginBottom: SPACING.sm,
                            ...SHADOWS.card,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="trending-up" size={16} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    value={metric.outcome}
                                    onChangeText={(v) => dispatch({ type: 'UPDATE_METRIC', index: i, field: 'outcome', value: v })}
                                    placeholder="Metric name (e.g. Revenue Growth)"
                                    placeholderTextColor={COLORS.textMuted}
                                    style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: COLORS.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 2 }}
                                />
                                <TextInput
                                    value={metric.targetValue}
                                    onChangeText={(v) => dispatch({ type: 'UPDATE_METRIC', index: i, field: 'targetValue', value: v })}
                                    placeholder="Target (e.g. 15% Quarterly)"
                                    placeholderTextColor={COLORS.textMuted}
                                    style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: COLORS.textPrimary, paddingVertical: 2 }}
                                />
                            </View>
                            <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_METRIC', index: i })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>

        {/* Target Date */}
        <View>
            <SectionLabel text="Target Date" />
            <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.lg, padding: SPACING.xl, ...SHADOWS.card }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        value={state.expectedOutcomeDate}
                        onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'expectedOutcomeDate', value: v })}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={COLORS.textMuted}
                        style={{ flex: 1, fontFamily: 'Inter_500Medium', fontSize: 16, color: COLORS.textPrimary, paddingVertical: 4 }}
                    />
                    <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textSecondary, marginTop: 8, lineHeight: 18 }}>
                    When do you expect these outcomes to be fully realized?
                </Text>
            </View>
        </View>

        {/* Confidence Slider */}
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <SectionLabel text="Confidence" />
                <View style={{ backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#FFFFFF' }}>{state.confidenceLevel} / 10</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                    <TouchableOpacity
                        key={level}
                        onPress={() => dispatch({ type: 'SET_FIELD', field: 'confidenceLevel', value: level })}
                        style={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: level <= state.confidenceLevel ? COLORS.primary : COLORS.surfaceDim,
                        }}
                    />
                ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Tentative
                </Text>
                <Text
                    style={{
                        fontFamily: 'Inter_700Bold',
                        fontSize: 11,
                        color: state.confidenceLevel >= 7 ? COLORS.primary : COLORS.textMuted,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                    }}
                >
                    Unshakeable
                </Text>
            </View>
        </View>

        {/* Motivational footer */}
        <View style={{ backgroundColor: COLORS.primarySurface, borderRadius: RADII.xl, padding: SPACING.xxl, alignItems: 'center' }}>
            <Ionicons name="bulb-outline" size={28} color={COLORS.primary} style={{ marginBottom: 12, opacity: 0.6 }} />
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.primary, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 }}>
                "{MOTIVATIONAL_QUOTES[2]}"
            </Text>
        </View>
    </View>
);
