/**
 * AI Chat Screen — Premium Decision Advisor chat experience.
 *
 * Features:
 *  - Real-time streaming text (SSE) with animated cursor
 *  - Premium chat bubble UI (user: indigo, advisor: white)
 *  - "Personal decision intelligence" empty state — not a generic chatbot
 *  - Session management (new chat, history)
 *  - Decision context linking via decisionId param
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { aiService, type SSEEvent } from '@/services/aiService';
import { useChatHistory, useInvalidateSessions } from '@/hooks/useAI';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
    createdAt: string;
};

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

const ChatBubble: React.FC<{ message: DisplayMessage }> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <View
            style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '84%',
                marginBottom: SPACING.md,
                marginHorizontal: SPACING.xl,
            }}
        >
            {/* Advisor label */}
            {!isUser && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: COLORS.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                    </View>
                    <Text
                        style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 11,
                            color: COLORS.textSecondary,
                            letterSpacing: 0.2,
                        }}
                    >
                        LifeOS Advisor
                    </Text>
                </View>
            )}

            {/* Bubble */}
            <View
                style={{
                    backgroundColor: isUser ? COLORS.primary : COLORS.surfaceLowest,
                    borderRadius: 18,
                    borderTopRightRadius: isUser ? 4 : 18,
                    borderTopLeftRadius: isUser ? 18 : 4,
                    paddingHorizontal: SPACING.lg,
                    paddingVertical: 12,
                    ...(isUser
                        ? SHADOWS.button
                        : { ...SHADOWS.card }),
                }}
            >
                <Text
                    style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 15,
                        lineHeight: 23,
                        color: isUser ? '#FFFFFF' : COLORS.textPrimary,
                    }}
                >
                    {message.content}
                    {message.isStreaming && (
                        <Text style={{ color: isUser ? 'rgba(255,255,255,0.7)' : COLORS.primary }}>
                            {' ▊'}
                        </Text>
                    )}
                </Text>
            </View>

            {/* Timestamp */}
            <Text
                style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 10,
                    color: '#9CA3AF',
                    marginTop: 4,
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    marginHorizontal: 4,
                }}
            >
                {formatTime(message.createdAt)}
            </Text>
        </View>
    );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
    <View style={{ alignSelf: 'flex-start', marginHorizontal: SPACING.xl, marginBottom: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <View
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: COLORS.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Ionicons name="sparkles" size={10} color="#FFFFFF" />
            </View>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.textSecondary }}>
                LifeOS Advisor
            </Text>
        </View>
        <View
            style={{
                backgroundColor: COLORS.surfaceLowest,
                borderRadius: 18,
                borderTopLeftRadius: 4,
                paddingHorizontal: SPACING.lg,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.sm,
                ...SHADOWS.card,
            }}
        >
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textSecondary }}>
                Analyzing your history...
            </Text>
        </View>
    </View>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const SUGGESTIONS = [
    'What patterns do you see in my decisions?',
    'Should I trust my confidence levels?',
    'Where do I tend to have regrets?',
];

const EmptyState: React.FC<{ onSuggestionPress: (text: string) => void }> = ({ onSuggestionPress }) => (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xxl, paddingBottom: 80 }}>
        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
            <View
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: COLORS.primarySurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: SPACING.lg,
                }}
            >
                <Ionicons name="sparkles" size={28} color={COLORS.primary} />
            </View>
            <Text
                style={{
                    fontFamily: 'Inter_800ExtraBold',
                    fontSize: 22,
                    color: COLORS.textPrimary,
                    letterSpacing: -0.5,
                    textAlign: 'center',
                    marginBottom: SPACING.sm,
                }}
            >
                Decision Advisor
            </Text>
            <Text
                style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: COLORS.textSecondary,
                    textAlign: 'center',
                    lineHeight: 21,
                }}
            >
                Powered by your personal decision history, patterns, and outcomes.
            </Text>
        </View>

        {/* Context pipeline explanation */}
        <View
            style={{
                backgroundColor: COLORS.surfaceLowest,
                borderRadius: RADII.xl,
                padding: SPACING.xl,
                marginBottom: SPACING.xxl,
                ...SHADOWS.card,
            }}
        >
            <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted, marginBottom: SPACING.md }]}>
                What the AI considers
            </Text>
            {[
                { icon: 'person-outline' as const, label: 'Your decision profile & traits' },
                { icon: 'trending-up-outline' as const, label: 'Category history & patterns' },
                { icon: 'layers-outline' as const, label: 'Similar past decisions (semantic)' },
                { icon: 'bulb-outline' as const, label: 'Detected behavioral patterns' },
            ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: i < 3 ? SPACING.sm : 0 }}>
                    <View
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            backgroundColor: COLORS.primarySurface,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name={item.icon} size={14} color={COLORS.primary} />
                    </View>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textBody }}>
                        {item.label}
                    </Text>
                </View>
            ))}
        </View>

        {/* Suggestion chips */}
        <Text style={[TYPOGRAPHY.label, { color: COLORS.textMuted, marginBottom: SPACING.md }]}>
            Try asking
        </Text>
        {SUGGESTIONS.map((suggestion, i) => (
            <TouchableOpacity
                key={i}
                onPress={() => onSuggestionPress(suggestion)}
                activeOpacity={0.7}
                style={{
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.md,
                    padding: SPACING.md,
                    marginBottom: SPACING.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: COLORS.surfaceDim,
                }}
            >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.primary, flex: 1 }}>
                    {suggestion}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
        ))}
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AiChatScreen() {
    const router = useRouter();
    const { decisionId, sessionId: paramSessionId } = useLocalSearchParams<{
        decisionId?: string;
        sessionId?: string;
    }>();

    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(paramSessionId);

    const flatListRef = useRef<FlatList>(null);
    const invalidateSessions = useInvalidateSessions();
    const inputRef = useRef(input);
    useEffect(() => { inputRef.current = input; }, [input]);
    const isLoadingRef = useRef(isLoading);
    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
    const isStreamingRef = useRef(isStreaming);
    useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);

    const { data: existingSession } = useChatHistory(paramSessionId || '');

    useEffect(() => {
        if (existingSession && paramSessionId) {
            const loaded: DisplayMessage[] = existingSession.messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                    id: m.id,
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                    createdAt: m.createdAt,
                }));
            setMessages(loaded);
            setCurrentSessionId(paramSessionId);
        }
    }, [existingSession, paramSessionId]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);
    }, []);

    const handleSend = useCallback(async (textOverride?: string) => {
        if (isLoadingRef.current || isStreamingRef.current) return;
        const trimmed = (textOverride || inputRef.current).trim();
        if (!trimmed) return;

        Keyboard.dismiss();
        if (!textOverride) setInput('');

        const userMsg: DisplayMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        scrollToBottom();

        const assistantId = `assistant-${Date.now()}`;
        setIsLoading(true);

        try {
            await aiService.sendChatMessage(
                {
                    sessionId: currentSessionId,
                    message: trimmed,
                    decisionId: decisionId || undefined,
                },
                (event: SSEEvent) => {
                    if (event.type === 'session') {
                        setCurrentSessionId(event.sessionId);
                    } else if (event.type === 'delta') {
                        setIsLoading(false);
                        setIsStreaming(true);
                        setMessages((prev) => {
                            const existing = prev.find((m) => m.id === assistantId);
                            if (existing) {
                                return prev.map((m) =>
                                    m.id === assistantId
                                        ? { ...m, content: m.content + event.text, isStreaming: true }
                                        : m
                                );
                            }
                            return [
                                ...prev,
                                {
                                    id: assistantId,
                                    role: 'assistant' as const,
                                    content: event.text,
                                    isStreaming: true,
                                    createdAt: new Date().toISOString(),
                                },
                            ];
                        });
                        scrollToBottom();
                    } else if (event.type === 'done') {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, isStreaming: false } : m
                            )
                        );
                    }
                },
                (err) => {
                    console.error('Chat error:', err);
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: assistantId,
                            role: 'assistant',
                            content: 'Sorry, I encountered an error. Please try again.',
                            createdAt: new Date().toISOString(),
                        },
                    ]);
                },
                () => {
                    setIsLoading(false);
                    setIsStreaming(false);
                    invalidateSessions();
                    scrollToBottom();
                },
            );
        } catch {
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, [currentSessionId, decisionId, scrollToBottom, invalidateSessions]);

    const handleNewChat = () => {
        setMessages([]);
        setCurrentSessionId(undefined);
        setInput('');
    };

    const canSend = input.trim().length > 0 && !isLoading && !isStreaming;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.surface }}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

            {/* ── Header ── */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: SPACING.lg,
                    paddingVertical: SPACING.md,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.surfaceDim,
                    backgroundColor: COLORS.surfaceLowest,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/ai/history')}
                    style={{ padding: SPACING.sm }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Chat history"
                    accessibilityRole="button"
                >
                    <Ionicons name="time-outline" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: COLORS.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                        </View>
                        <Text
                            style={{
                                fontFamily: 'Inter_700Bold',
                                fontSize: 16,
                                color: COLORS.textPrimary,
                            }}
                        >
                            AI Advisor
                        </Text>
                    </View>
                    {currentSessionId && (
                        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9CA3AF' }}>
                            Session active
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleNewChat}
                    style={{ padding: SPACING.sm }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="New conversation"
                    accessibilityRole="button"
                >
                    <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* ── Messages or empty state ── */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                {messages.length === 0 && !isLoading ? (
                    <EmptyState onSuggestionPress={(text) => handleSend(text)} />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ChatBubble message={item} />}
                        contentContainerStyle={{
                            paddingTop: SPACING.xl,
                            paddingBottom: SPACING.sm,
                        }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={scrollToBottom}
                        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
                    />
                )}

                {/* ── Input Bar ── */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        paddingHorizontal: SPACING.md,
                        paddingVertical: SPACING.md,
                        paddingBottom: 18,
                        backgroundColor: COLORS.surfaceLowest,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.surfaceDim,
                        gap: SPACING.sm,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: COLORS.surface,
                            borderRadius: 22,
                            paddingHorizontal: SPACING.lg,
                            paddingVertical: Platform.OS === 'ios' ? 11 : 8,
                            maxHeight: 120,
                            borderWidth: 1.5,
                            borderColor: COLORS.outlineVariant,
                        }}
                    >
                        <TextInput
                            style={{
                                fontFamily: 'Inter_400Regular',
                                fontSize: 15,
                                color: COLORS.textPrimary,
                                maxHeight: 100,
                            }}
                            placeholder="Ask about your decisions..."
                            placeholderTextColor="#9CA3AF"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            returnKeyType="default"
                            editable={!isStreaming}
                            accessibilityLabel="Chat input"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => handleSend()}
                        disabled={!canSend}
                        activeOpacity={0.8}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: canSend ? COLORS.primary : COLORS.surfaceDim,
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...(canSend ? SHADOWS.button : {}),
                        }}
                        accessibilityLabel="Send message"
                        accessibilityRole="button"
                    >
                        <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}
