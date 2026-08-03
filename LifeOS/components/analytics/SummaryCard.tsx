/**
 * SummaryCard — Premium KPI metric card for the Analytics screen.
 *
 * Design: white card with tinted icon circle, large numeric value,
 * subtle label. Shows the core decision health metrics.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

interface SummaryCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | number;
    color: string;
    bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, color, bgColor }) => (
    <View
        style={{
            width: '47%',
            backgroundColor: COLORS.surfaceLowest,
            borderRadius: RADII.xl,
            padding: SPACING.xl,
            ...SHADOWS.cardMedium,
        }}
    >
        {/* Icon */}
        <View
            style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: bgColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.md,
            }}
        >
            <Ionicons name={icon as any} size={20} color={color} />
        </View>

        {/* Value */}
        <Text
            style={{
                fontFamily: 'Inter_800ExtraBold',
                fontSize: 28,
                color: COLORS.textPrimary,
                letterSpacing: -1,
                lineHeight: 34,
                marginBottom: 4,
            }}
        >
            {value}
        </Text>

        {/* Label */}
        <Text
            style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: COLORS.textSecondary,
                lineHeight: 16,
            }}
            numberOfLines={2}
        >
            {label}
        </Text>
    </View>
);

export default SummaryCard;
