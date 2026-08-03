/**
 * WizardStep1 — Foundations: template, title, category, description.
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionLabel } from './StepIndicator';
import { PressableScale } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import { CATEGORIES, MOTIVATIONAL_QUOTES } from '@/utils/constants';
import { getCategoryColor } from '@/utils/helpers';
import type { WizardState, WizardAction } from './wizardReducer';

type Step1Props = {
    state: WizardState;
    dispatch: React.Dispatch<WizardAction>;
    onTemplatePress: () => void;
    showAllCategories: boolean;
    setShowAllCategories: (v: boolean) => void;
};

export const WizardStep1: React.FC<Step1Props> = ({
    state,
    dispatch,
    onTemplatePress,
    showAllCategories,
    setShowAllCategories,
}) => {
    const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);

    return (
        <View style={{ gap: 24 }}>
            {/* Autofill from Template */}
            <PressableScale
                onPress={onTemplatePress}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.lg,
                    padding: SPACING.lg,
                    ...SHADOWS.card,
                }}
            >
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: RADII.md,
                        backgroundColor: COLORS.primarySurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: SPACING.md,
                    }}
                >
                    <Ionicons name="sparkles" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: COLORS.textPrimary }}>
                        Autofill from Template
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
                        Start with pre-defined frameworks
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </PressableScale>

            {/* Decision Title */}
            <View>
                <SectionLabel text="Decision Title" />
                <TextInput
                    value={state.title}
                    onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'title', value: v })}
                    placeholder="What is the choice ahead..."
                    placeholderTextColor={COLORS.textMuted}
                    style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 22,
                        color: COLORS.textPrimary,
                        letterSpacing: -0.5,
                        paddingVertical: 8,
                        borderBottomWidth: 0,
                    }}
                    multiline
                />
            </View>

            {/* Primary Category */}
            <View>
                <SectionLabel text="Primary Category" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    {visibleCategories.map((cat) => {
                        const isActive = state.category === cat.key;
                        const catColor = getCategoryColor(cat.key);
                        return (
                            <TouchableOpacity
                                key={cat.key}
                                onPress={() => dispatch({ type: 'SET_FIELD', field: 'category', value: cat.key })}
                                activeOpacity={0.8}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: SPACING.sm,
                                    paddingHorizontal: SPACING.lg,
                                    paddingVertical: 12,
                                    borderRadius: RADII.md,
                                    borderWidth: 1.5,
                                    borderColor: isActive ? catColor : COLORS.outlineVariant,
                                    backgroundColor: isActive ? catColor + '12' : COLORS.surfaceLowest,
                                }}
                            >
                                <Ionicons name={cat.icon} size={16} color={isActive ? catColor : COLORS.textSecondary} />
                                <Text
                                    style={{
                                        fontFamily: isActive ? 'Inter_700Bold' : 'Inter_500Medium',
                                        fontSize: 14,
                                        color: isActive ? catColor : COLORS.textPrimary,
                                    }}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {!showAllCategories && (
                    <TouchableOpacity onPress={() => setShowAllCategories(true)} style={{ marginTop: SPACING.md }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: COLORS.primary }}>
                            Show more categories...
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Context & Nuance */}
            <View>
                <SectionLabel text="Context & Nuance" />
                <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.lg, padding: SPACING.xl, minHeight: 120, ...SHADOWS.card }}>
                    <TextInput
                        value={state.description}
                        onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'description', value: v })}
                        placeholder="Describe the stakes, the potential outcomes, and how you feel about this decision..."
                        placeholderTextColor={COLORS.textMuted}
                        style={{
                            fontFamily: 'Inter_400Regular',
                            fontSize: 15,
                            color: COLORS.textPrimary,
                            lineHeight: 24,
                            textAlignVertical: 'top',
                        }}
                        multiline
                    />
                </View>
            </View>

            {/* Motivational Card */}
            <View style={{ backgroundColor: COLORS.primarySurface, borderRadius: RADII.xl, padding: SPACING.xxl, alignItems: 'center' }}>
                <Ionicons name="compass-outline" size={32} color={COLORS.primary} style={{ marginBottom: 12, opacity: 0.6 }} />
                <Text
                    style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: COLORS.primary,
                        textAlign: 'center',
                        fontStyle: 'italic',
                        lineHeight: 22,
                    }}
                >
                    {MOTIVATIONAL_QUOTES[0]}
                </Text>
            </View>
        </View>
    );
};
