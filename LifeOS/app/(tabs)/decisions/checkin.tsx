/**
 * Outcome Check-in Screen — Form for recording decision outcomes.
 *
 * Fields: satisfaction score, actual results, reflections, lessons learned,
 * mood, stress, and whether they'd decide again.
 */

import React, { useState } from 'react';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import { PressableScale } from '@/components/ui';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDecision, useCreateOutcome } from '@/hooks/useDecisions';

const MOODS = [
    { value: 2, emoji: '😞', label: 'Low' },
    { value: 4, emoji: '😐', label: 'Okay' },
    { value: 6, emoji: '🙂', label: 'Good' },
    { value: 8, emoji: '😊', label: 'Great' },
    { value: 10, emoji: '🤩', label: 'Amazing' },
];

export default function CheckinScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: decision } = useDecision(id!);
    const createOutcome = useCreateOutcome();

    const [satisfaction, setSatisfaction] = useState(5);
    const [actualResults, setActualResults] = useState('');
    const [reflections, setReflections] = useState('');
    const [lessonsLearned, setLessonsLearned] = useState('');
    const [wouldDecideAgain, setWouldDecideAgain] = useState<boolean | null>(null);
    const [mood, setMood] = useState(6);
    const [stress, setStress] = useState(5);

    const canSubmit = actualResults.trim().length > 0;

    const handleSubmit = () => {
        if (!canSubmit) {
            Alert.alert('Required', 'Please describe the actual results of this decision.');
            return;
        }

        createOutcome.mutate(
            {
                decisionId: id!,
                satisfactionScore: satisfaction,
                actualResults: actualResults.trim(),
                reflections: reflections.trim() || undefined,
                lessonsLearned: lessonsLearned.trim() || undefined,
                wouldDecideAgain: wouldDecideAgain ?? undefined,
                moodAtCheckIn: mood,
                stressLevel: stress,
            },
            {
                onSuccess: () => {
                    Alert.alert('Check-in Recorded', 'Your outcome has been saved successfully.', [
                        { text: 'OK', onPress: () => router.back() },
                    ]);
                },
                onError: (error: any) => {
                    Alert.alert('Error', error?.response?.data?.error || 'Failed to save check-in.');
                },
            },
        );
    };

    // ─── Section Label ────────────────────────────────────────────────────────

    const SectionLabel = ({ icon, label }: { icon: string; label: string }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md, marginTop: SPACING.xxl }}>
            <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: COLORS.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={icon as any} size={13} color={COLORS.primary} />
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>
                {label}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* ── Header ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.surfaceDim }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: SPACING.sm }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[TYPOGRAPHY.heading, { color: COLORS.textPrimary }]}>Outcome Check-in</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>

                    {/* Decision context banner */}
                    {decision && (
                        <View style={{ backgroundColor: COLORS.primarySurface, borderRadius: RADII.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Ionicons name="layers" size={16} color="#FFFFFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.primary, marginBottom: 2 }}>Recording outcome for</Text>
                                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: COLORS.textPrimary }} numberOfLines={1}>{decision.title}</Text>
                            </View>
                        </View>
                    )}

                    {/* ── Satisfaction Score ── */}
                    <SectionLabel icon="star-outline" label="Satisfaction Score" />
                    <View style={{ backgroundColor: COLORS.surfaceLowest, borderRadius: RADII.xl, padding: SPACING.xxl, ...SHADOWS.cardMedium }}>
                        <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 52, color: COLORS.primary, textAlign: 'center', letterSpacing: -2 }}>{satisfaction}</Text>
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg }}>out of 10</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                                <TouchableOpacity
                                    key={v}
                                    onPress={() => setSatisfaction(v)}
                                    activeOpacity={0.7}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: v <= satisfaction ? COLORS.primary : COLORS.surfaceDim,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: v <= satisfaction ? '#FFFFFF' : '#9CA3AF' }}>{v}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* ── Actual Results (required) ── */}
                    <SectionLabel icon="checkmark-circle-outline" label="Actual Results *" />
                    <TextInput
                        value={actualResults}
                        onChangeText={setActualResults}
                        placeholder="What actually happened as a result of this decision?"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        style={{
                            backgroundColor: COLORS.surfaceLowest,
                            borderRadius: RADII.lg,
                            padding: SPACING.xl,
                            minHeight: 100,
                            fontFamily: 'Inter_400Regular',
                            fontSize: 15,
                            color: COLORS.textPrimary,
                            lineHeight: 22,
                        }}
                    />

                    {/* ── Reflections ── */}
                    <SectionLabel icon="chatbubble-ellipses-outline" label="Reflections" />
                    <TextInput
                        value={reflections}
                        onChangeText={setReflections}
                        placeholder="Looking back, what are your thoughts?"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        style={{
                            backgroundColor: COLORS.surfaceLowest,
                            borderRadius: RADII.lg,
                            padding: SPACING.xl,
                            minHeight: 80,
                            fontFamily: 'Inter_400Regular',
                            fontSize: 15,
                            color: COLORS.textPrimary,
                            lineHeight: 22,
                        }}
                    />

                    {/* ── Lessons Learned ── */}
                    <SectionLabel icon="school-outline" label="Lessons Learned" />
                    <TextInput
                        value={lessonsLearned}
                        onChangeText={setLessonsLearned}
                        placeholder="What would you do differently next time?"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        style={{
                            backgroundColor: COLORS.surfaceLowest,
                            borderRadius: RADII.lg,
                            padding: SPACING.xl,
                            minHeight: 80,
                            fontFamily: 'Inter_400Regular',
                            fontSize: 15,
                            color: COLORS.textPrimary,
                            lineHeight: 22,
                        }}
                    />

                    {/* ── Would Decide Again ── */}
                    <SectionLabel icon="refresh-outline" label="Would you decide the same way again?" />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {([
                            { value: true, label: 'Yes', icon: 'thumbs-up-outline', color: '#10B981' },
                            { value: false, label: 'No', icon: 'thumbs-down-outline', color: '#EF4444' },
                        ] as const).map((opt) => {
                            const isSelected = wouldDecideAgain === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.label}
                                    onPress={() => setWouldDecideAgain(isSelected ? null : opt.value)}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        paddingVertical: 14,
                                        borderRadius: 14,
                                        backgroundColor: isSelected ? opt.color + '15' : '#FFFFFF',
                                        borderWidth: 1.5,
                                        borderColor: isSelected ? opt.color : '#E5E7EB',
                                    }}
                                >
                                    <Ionicons name={opt.icon as any} size={20} color={isSelected ? opt.color : '#9CA3AF'} />
                                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: isSelected ? opt.color : '#6B7280' }}>{opt.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Mood ── */}
                    <SectionLabel icon="happy-outline" label="Current Mood" />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {MOODS.map((m) => {
                            const isSelected = mood === m.value;
                            return (
                                <TouchableOpacity
                                    key={m.value}
                                    onPress={() => setMood(m.value)}
                                    style={{
                                        alignItems: 'center',
                                        gap: 4,
                                        paddingVertical: 10,
                                        paddingHorizontal: 8,
                                        borderRadius: 12,
                                        backgroundColor: isSelected ? '#4F46E5' + '15' : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: isSelected ? '#4F46E5' : '#9CA3AF' }}>{m.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Stress Level ── */}
                    <SectionLabel icon="pulse-outline" label={`Stress Level: ${stress}/10`} />
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: 'rgba(0,0,0,0.5)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                                <TouchableOpacity
                                    key={v}
                                    onPress={() => setStress(v)}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        backgroundColor: v <= stress
                                            ? (stress <= 3 ? '#10B981' : stress <= 6 ? '#F59E0B' : '#EF4444')
                                            : '#F3F4F6',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: v <= stress ? '#FFFFFF' : '#9CA3AF' }}>{v}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#10B981' }}>Relaxed</Text>
                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#EF4444' }}>Very Stressed</Text>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Submit Button ── */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.xxl, paddingBottom: 32, paddingTop: SPACING.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.surfaceDim }}>
                <PressableScale
                    onPress={handleSubmit}
                    disabled={!canSubmit || createOutcome.isPending}
                    accessibilityLabel="Save check-in"
                    accessibilityRole="button"
                >
                    <LinearGradient
                        colors={canSubmit ? ['#3525CD', COLORS.primary] : [COLORS.surfaceDim, COLORS.surfaceDim]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            paddingVertical: 16,
                            borderRadius: RADII.md,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...(canSubmit ? SHADOWS.button : {}),
                        }}
                    >
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: canSubmit ? '#FFFFFF' : COLORS.textSecondary }}>
                            {createOutcome.isPending ? 'Saving...' : 'Save Check-in'}
                        </Text>
                    </LinearGradient>
                </PressableScale>
            </View>
        </SafeAreaView>
    );
}
