/**
 * DecisionCard — Premium card for the decision list.
 *
 * Features:
 *  • Spring press animation via PressableScale
 *  • Left 3px category accent bar
 *  • Category icon in tinted circle
 *  • Confidence ring (circular progress)
 *  • Category + status pill badges
 *  • Time metadata
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/ui';
import type { Decision } from '@/services/decisionService';
import {
    getCategoryIcon,
    getCategoryColor,
    getCategoryBg,
    getStatusColor,
    getConfidenceColor,
    timeAgo,
} from '@/utils/helpers';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

type DecisionCardProps = {
    decision: Decision;
    onPress: () => void;
};

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onPress }) => {
    const catColor = getCategoryColor(decision.category);
    const catBg = getCategoryBg(decision.category);
    const statusColor = getStatusColor(decision.status);
    const confColor = getConfidenceColor(decision.confidenceLevel);

    return (
        <PressableScale
            onPress={onPress}
            style={{
                backgroundColor: COLORS.surfaceLowest,
                borderRadius: RADII.xl,
                marginBottom: SPACING.md,
                marginHorizontal: SPACING.xxl,
                overflow: 'hidden',
                ...SHADOWS.cardMedium,
            }}
            accessibilityLabel={`Decision: ${decision.title}`}
            accessibilityRole="button"
        >
            {/* Category accent bar */}
            <View
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    backgroundColor: catColor,
                }}
            />

            <View style={{ padding: SPACING.xl, paddingLeft: SPACING.xl + 3 }}>
                {/* Top row: icon + title + confidence ring */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: SPACING.md,
                        marginBottom: SPACING.md,
                    }}
                >
                    {/* Category icon */}
                    <View
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 13,
                            backgroundColor: catBg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Ionicons name={getCategoryIcon(decision.category)} size={20} color={catColor} />
                    </View>

                    {/* Title + description */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontFamily: 'Inter_700Bold',
                                fontSize: 15,
                                color: COLORS.textPrimary,
                                lineHeight: 22,
                                letterSpacing: -0.2,
                            }}
                            numberOfLines={2}
                        >
                            {decision.title}
                        </Text>
                        {decision.description ? (
                            <Text
                                style={{
                                    fontFamily: 'Inter_400Regular',
                                    fontSize: 13,
                                    color: COLORS.textSecondary,
                                    lineHeight: 18,
                                    marginTop: 3,
                                }}
                                numberOfLines={1}
                            >
                                {decision.description}
                            </Text>
                        ) : null}
                    </View>

                    {/* Confidence ring */}
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            borderWidth: 2.5,
                            borderColor: confColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: COLORS.surfaceLowest,
                            flexShrink: 0,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: 'Inter_800ExtraBold',
                                fontSize: 12,
                                color: confColor,
                                lineHeight: 14,
                            }}
                        >
                            {decision.confidenceLevel}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: COLORS.surfaceDim, marginBottom: SPACING.md }} />

                {/* Bottom: category badge + status + time */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: SPACING.xs, alignItems: 'center' }}>
                        {/* Category pill */}
                        <View
                            style={{
                                backgroundColor: catBg,
                                borderRadius: RADII.sm,
                                paddingHorizontal: SPACING.sm,
                                paddingVertical: 3,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: 'Inter_600SemiBold',
                                    fontSize: 11,
                                    color: catColor,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {decision.category.replace(/_/g, ' ')}
                            </Text>
                        </View>

                        {/* Status pill */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: statusColor + '14',
                                borderRadius: RADII.sm,
                                paddingHorizontal: SPACING.sm,
                                paddingVertical: 3,
                            }}
                        >
                            <View
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: 2.5,
                                    backgroundColor: statusColor,
                                }}
                            />
                            <Text
                                style={{
                                    fontFamily: 'Inter_600SemiBold',
                                    fontSize: 11,
                                    color: statusColor,
                                    textTransform: 'capitalize',
                                }}
                            >
                                {decision.status}
                            </Text>
                        </View>
                    </View>

                    <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textSecondary }]}>
                        {timeAgo(decision.updatedAt)}
                    </Text>
                </View>
            </View>
        </PressableScale>
    );
};
