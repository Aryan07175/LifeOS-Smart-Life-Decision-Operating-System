/**
 * CategoryBreakdown — Animated horizontal bar chart showing decisions per category.
 *
 * Design: clean horizontal bars with category color, label, and count.
 * Bars animate from width=0 on first render via Animated.timing.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';
import { getCategoryColor } from '@/utils/helpers';

interface CategoryBreakdownProps {
    data: Array<{ category: string; count: number; avgSatisfaction?: number }>;
}

const AnimatedBar: React.FC<{
    category: string;
    count: number;
    maxCount: number;
    avgSatisfaction?: number;
    index: number;
}> = ({ category, count, maxCount, avgSatisfaction, index }) => {
    const color = getCategoryColor(category);
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: count / maxCount,
            duration: 600,
            delay: index * 80,
            useNativeDriver: false,
        }).start();
    }, [count, maxCount, index, widthAnim]);

    return (
        <View style={{ marginBottom: SPACING.md }}>
            {/* Label row */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: color,
                        }}
                    />
                    <Text
                        style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: 13,
                            color: COLORS.textBody,
                            textTransform: 'capitalize',
                        }}
                    >
                        {category.replace(/_/g, ' ')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {avgSatisfaction != null && (
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.textSecondary }}>
                            ★ {avgSatisfaction.toFixed(1)}
                        </Text>
                    )}
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: COLORS.textPrimary }}>
                        {count}
                    </Text>
                </View>
            </View>

            {/* Bar track */}
            <View
                style={{
                    height: 8,
                    backgroundColor: COLORS.surfaceDim,
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                <Animated.View
                    style={{
                        height: '100%',
                        borderRadius: 4,
                        backgroundColor: color,
                        width: widthAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                        }),
                    }}
                />
            </View>
        </View>
    );
};

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
        <View
            style={{
                backgroundColor: COLORS.surfaceLowest,
                borderRadius: RADII.xl,
                padding: SPACING.xl,
                ...SHADOWS.cardMedium,
            }}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: SPACING.xl,
                }}
            >
                <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>Category Breakdown</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.textSecondary }}>
                    {data.reduce((s, d) => s + d.count, 0)} total
                </Text>
            </View>

            {/* Bars */}
            {data.map((item, i) => (
                <AnimatedBar
                    key={item.category}
                    category={item.category}
                    count={item.count}
                    maxCount={maxCount}
                    avgSatisfaction={item.avgSatisfaction}
                    index={i}
                />
            ))}
        </View>
    );
};

export default CategoryBreakdown;
