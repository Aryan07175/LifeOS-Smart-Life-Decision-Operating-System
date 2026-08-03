/**
 * Decision Wizard Screen — 3-step form for creating or editing a decision.
 *
 * Create mode: Shows AI pre-decision analysis before final creation.
 * Edit mode: pass ?editId=<id> to pre-populate from existing decision.
 */

import React, { useReducer, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/ui';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCreateDecision, useUpdateDecision, useDecision } from '@/hooks/useDecisions';
import { usePreDecisionAnalysis } from '@/hooks/useAI';
import type { DecisionCreatePayload, Alternative, ExpectedOutcome, Template } from '@/services/decisionService';
import type { PreDecisionAnalysis } from '@/services/aiService';

import {
    StepIndicator,
    WizardStep1,
    WizardStep2,
    WizardStep3,
    TemplatePicker,
    AnalysisSheet,
    wizardReducer,
    initialWizardState,
} from '@/components/decisions';

const TOTAL_STEPS = 3;

export default function NewDecisionScreen() {
    const router = useRouter();
    const { editId } = useLocalSearchParams<{ editId?: string }>();
    const isEditMode = !!editId;

    const [step, setStep] = useState(1);
    const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Analysis state
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PreDecisionAnalysis | null>(null);
    const [pendingPayload, setPendingPayload] = useState<DecisionCreatePayload | null>(null);

    const createMutation = useCreateDecision();
    const updateMutation = useUpdateDecision();
    const analysisMutation = usePreDecisionAnalysis();
    const { data: existingDecision } = useDecision(editId || '');

    // Pre-populate form when editing
    useEffect(() => {
        if (isEditMode && existingDecision && !loaded) {
            dispatch({ type: 'LOAD_DECISION', decision: existingDecision });
            setLoaded(true);
        }
    }, [isEditMode, existingDecision, loaded]);

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    // ── Validation ──
    const canGoNext = (): boolean => {
        if (step === 1) return state.title.trim().length > 0;
        return true;
    };

    // ── Navigation handlers ──
    const handleNext = () => {
        if (step < TOTAL_STEPS) setStep(step + 1);
    };
    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };
    const handleClose = () => {
        if (state.title.trim()) {
            Alert.alert(
                'Discard Changes?',
                'You have unsaved changes. Are you sure you want to discard?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                ],
            );
        } else {
            router.back();
        }
    };

    // ── Build payload from form state ──
    const buildPayload = (): DecisionCreatePayload => {
        const alternatives: Alternative[] = state.alternatives
            .filter((a) => a.trim())
            .map((option) => ({ option }));

        const expectedOutcomes: ExpectedOutcome[] = state.expectedOutcomes
            .filter((m) => m.outcome.trim())
            .map((m) => ({
                outcome: m.outcome,
                metric: m.metric || m.outcome.toLowerCase().replace(/\s+/g, '_'),
                targetValue: parseFloat(m.targetValue) || undefined,
            }));

        let expectedOutcomeDate: string | undefined;
        if (state.expectedOutcomeDate.trim()) {
            const d = new Date(state.expectedOutcomeDate);
            if (!isNaN(d.getTime())) {
                expectedOutcomeDate = d.toISOString().split('T')[0];
            }
        }

        return {
            title: state.title.trim(),
            category: state.category,
            description: state.description.trim() || undefined,
            context: state.context.trim() || undefined,
            reasoningProcess: state.reasoningProcess.trim() || undefined,
            alternativesConsidered: alternatives.length > 0 ? alternatives : undefined,
            expectedOutcomes: expectedOutcomes.length > 0 ? expectedOutcomes : undefined,
            confidenceLevel: state.confidenceLevel,
            expectedOutcomeDate,
            tags: state.tags.length > 0 ? state.tags : undefined,
            isPrivate: true,
        };
    };

    // ── Submit: triggers analysis for create, direct update for edit ──
    const handleSubmit = () => {
        const payload = buildPayload();

        if (isEditMode) {
            updateMutation.mutate(
                { id: editId!, payload },
                {
                    onSuccess: () => router.back(),
                    onError: (error: any) => {
                        Alert.alert('Error', error?.response?.data?.error || 'Failed to update decision');
                    },
                },
            );
        } else {
            // Create mode: run pre-decision analysis first
            setPendingPayload(payload);
            setShowAnalysis(true);
            setAnalysisResult(null);

            analysisMutation.mutate(
                {
                    title: payload.title,
                    category: payload.category || 'other',
                    description: payload.description,
                    context: payload.context,
                    confidenceLevel: payload.confidenceLevel,
                    expectedOutcomes: payload.expectedOutcomes,
                    alternativesConsidered: payload.alternativesConsidered,
                },
                {
                    onSuccess: (data) => setAnalysisResult(data),
                    onError: () => {
                        // If analysis fails, proceed directly
                        setShowAnalysis(false);
                        confirmCreate(payload);
                    },
                },
            );
        }
    };

    // ── Confirm creation after analysis ──
    const confirmCreate = (payload: DecisionCreatePayload) => {
        setShowAnalysis(false);
        createMutation.mutate(payload, {
            onSuccess: (data) => {
                router.replace(`/(tabs)/decisions/${data.id}`);
            },
            onError: (error: any) => {
                Alert.alert('Error', error?.response?.data?.error || 'Failed to create decision');
            },
        });
    };

    const handleAnalysisProceed = () => {
        if (pendingPayload) confirmCreate(pendingPayload);
    };

    const handleAnalysisEdit = () => {
        setShowAnalysis(false);
        setAnalysisResult(null);
    };

    const handleTemplateSelect = (template: Template) => {
        dispatch({ type: 'APPLY_TEMPLATE', template });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surfaceLowest }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surfaceLowest} />

            {/* ── Header ── */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: SPACING.lg,
                    paddingVertical: SPACING.md,
                }}
            >
                <TouchableOpacity onPress={handleClose} style={{ padding: SPACING.sm }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={[TYPOGRAPHY.heading, { color: COLORS.textPrimary }]}>{isEditMode ? 'Edit Decision' : 'Decision Wizard'}</Text>
                <TouchableOpacity style={{ padding: SPACING.sm }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* ── Content ── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: SPACING.xxl, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <StepIndicator step={step} total={TOTAL_STEPS} />

                    {step === 1 && (
                        <WizardStep1
                            state={state}
                            dispatch={dispatch}
                            onTemplatePress={() => setShowTemplates(true)}
                            showAllCategories={showAllCategories}
                            setShowAllCategories={setShowAllCategories}
                        />
                    )}
                    {step === 2 && <WizardStep2 state={state} dispatch={dispatch} />}
                    {step === 3 && <WizardStep3 state={state} dispatch={dispatch} />}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Bottom Bar ── */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: SPACING.xxl,
                    paddingVertical: SPACING.lg,
                    paddingBottom: SPACING.xxxl,
                    backgroundColor: COLORS.surfaceLowest,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.surfaceDim,
                    gap: SPACING.md,
                }}
            >
                {step === 1 ? (
                    <>
                        <TouchableOpacity onPress={handleClose} style={{ paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl }}>
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: COLORS.textSecondary }}>Save Draft</Text>
                        </TouchableOpacity>
                        <PressableScale onPress={handleNext} disabled={!canGoNext()} style={{ flex: 1 }}>
                            <LinearGradient
                                colors={canGoNext() ? ['#3525CD', COLORS.primary] : [COLORS.surfaceDim, COLORS.surfaceDim]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 15, borderRadius: RADII.md, ...(canGoNext() ? SHADOWS.button : {}) }}
                            >
                                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: canGoNext() ? '#FFFFFF' : COLORS.textSecondary }}>Continue</Text>
                                <Ionicons name="arrow-forward" size={18} color={canGoNext() ? '#FFFFFF' : COLORS.textSecondary} />
                            </LinearGradient>
                        </PressableScale>
                    </>
                ) : step === 2 ? (
                    <>
                        <TouchableOpacity
                            onPress={handleBack}
                            activeOpacity={0.8}
                            style={{ paddingVertical: 15, paddingHorizontal: 28, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.outlineVariant, backgroundColor: '#FFFFFF' }}
                        >
                            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: COLORS.textPrimary }}>Back</Text>
                        </TouchableOpacity>
                        <PressableScale onPress={handleNext} style={{ flex: 1 }}>
                            <LinearGradient
                                colors={['#3525CD', COLORS.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 15, borderRadius: RADII.md, ...SHADOWS.button }}
                            >
                                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#FFFFFF' }}>Next</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                            </LinearGradient>
                        </PressableScale>
                    </>
                ) : (
                    <View style={{ flex: 1, gap: SPACING.md }}>
                        <PressableScale onPress={handleSubmit} disabled={isSubmitting || analysisMutation.isPending || !canGoNext()}>
                            <LinearGradient
                                colors={canGoNext() ? ['#3525CD', COLORS.primary] : [COLORS.surfaceDim, COLORS.surfaceDim]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    paddingVertical: 16,
                                    borderRadius: RADII.md,
                                    ...(canGoNext() ? SHADOWS.button : {}),
                                }}
                            >
                                {isSubmitting ? (
                                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: canGoNext() ? '#FFFFFF' : COLORS.textSecondary }}>{isEditMode ? 'Saving...' : 'Creating...'}</Text>
                                ) : (
                                    <>
                                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: canGoNext() ? '#FFFFFF' : COLORS.textSecondary }}>{isEditMode ? 'Save Changes' : 'Create Decision'}</Text>
                                        <Ionicons name={isEditMode ? 'checkmark-circle' : 'sparkles'} size={18} color={canGoNext() ? '#FFFFFF' : COLORS.textSecondary} />
                                    </>
                                )}
                            </LinearGradient>
                        </PressableScale>
                        <TouchableOpacity onPress={handleBack} activeOpacity={0.8} style={{ paddingVertical: SPACING.sm, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: COLORS.textSecondary }}>Back</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ── Template Picker ── */}
            <TemplatePicker
                visible={showTemplates}
                onClose={() => setShowTemplates(false)}
                onSelect={handleTemplateSelect}
            />

            {/* ── Pre-Decision Analysis Sheet ── */}
            <AnalysisSheet
                visible={showAnalysis}
                loading={analysisMutation.isPending}
                analysis={analysisResult}
                onProceed={handleAnalysisProceed}
                onEdit={handleAnalysisEdit}
                onClose={handleAnalysisEdit}
            />
        </SafeAreaView>
    );
}