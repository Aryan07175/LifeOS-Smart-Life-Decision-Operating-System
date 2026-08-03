/**
 * QualityTimeline — Clean SVG line chart showing monthly avg satisfaction.
 *
 * Design:
 *  • Indigo polyline with filled dots
 *  • Subtle grid lines
 *  • Month labels on X axis
 *  • Y-axis labels (0–10)
 *  • Empty state with explanation
 */

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, RADII, SHADOWS, TYPOGRAPHY } from '@/utils/designTokens';

interface QualityTimelineProps {
    data: Array<{ month: string; avgSatisfaction: number; outcomeCount: number }>;
}

const CHART_W = 300;
const CHART_H = 160;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PAD_LEFT = 32;
const PAD_RIGHT = 16;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

const QualityTimeline: React.FC<QualityTimelineProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <View
                style={{
                    backgroundColor: COLORS.surfaceLowest,
                    borderRadius: RADII.xl,
                    padding: SPACING.xl,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 130,
                    ...SHADOWS.cardMedium,
                }}
            >
                <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted, marginBottom: SPACING.sm }]}>
                    Satisfaction Over Time
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }]}>
                    Complete check-ins to see your satisfaction trend over time.
                </Text>
            </View>
        );
    }

    const MAX_SCORE = 10;
    const MIN_SCORE = 0;

    const getX = (i: number) =>
        PAD_LEFT + (i / Math.max(data.length - 1, 1)) * PLOT_W;
    const getY = (v: number) =>
        PAD_TOP + PLOT_H - ((v - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * PLOT_H;

    const points = data.map((d, i) => `${getX(i)},${getY(d.avgSatisfaction)}`).join(' ');

    // Y-axis reference lines: 2.5, 5, 7.5, 10
    const yRefs = [2.5, 5, 7.5, 10];

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
                    marginBottom: SPACING.md,
                }}
            >
                <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>Satisfaction Over Time</Text>
                {data.length > 0 && (
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.textSecondary }}>
                        Last {data.length} months
                    </Text>
                )}
            </View>

            {/* Chart */}
            <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
                {/* Grid lines + Y labels */}
                {yRefs.map((val) => (
                    <React.Fragment key={val}>
                        <Line
                            x1={PAD_LEFT}
                            y1={getY(val)}
                            x2={CHART_W - PAD_RIGHT}
                            y2={getY(val)}
                            stroke={COLORS.surfaceDim}
                            strokeWidth={1}
                            strokeDasharray="3 3"
                        />
                        <SvgText
                            x={PAD_LEFT - 6}
                            y={getY(val) + 4}
                            fontSize={8}
                            fill={COLORS.textSecondary}
                            textAnchor="end"
                            fontFamily="Inter_400Regular"
                        >
                            {val === 10 ? '10' : val}
                        </SvgText>
                    </React.Fragment>
                ))}

                {/* Polyline */}
                <Polyline
                    points={points}
                    fill="none"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Dots + month labels */}
                {data.map((d, i) => (
                    <React.Fragment key={i}>
                        {/* White ring */}
                        <Circle cx={getX(i)} cy={getY(d.avgSatisfaction)} r={5} fill={COLORS.surfaceLowest} />
                        {/* Colored dot */}
                        <Circle cx={getX(i)} cy={getY(d.avgSatisfaction)} r={3.5} fill={COLORS.primary} />
                        {/* Month label */}
                        <SvgText
                            x={getX(i)}
                            y={CHART_H - 8}
                            fontSize={9}
                            fill={COLORS.textSecondary}
                            textAnchor="middle"
                            fontFamily="Inter_400Regular"
                        >
                            {d.month.slice(5)}
                        </SvgText>
                    </React.Fragment>
                ))}
            </Svg>
        </View>
    );
};

export default QualityTimeline;
