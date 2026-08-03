/**
 * FadeInView — Animates children from opacity 0 + translateY offset to
 * fully visible. Equivalent to Animate UI's entrance animations.
 * Stagger via `delay` prop.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

type FadeInViewProps = {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    translateY?: number;
    style?: StyleProp<ViewStyle>;
};

export const FadeInView: React.FC<FadeInViewProps> = ({
    children,
    delay = 0,
    duration = 350,
    translateY = 12,
    style,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(translateY)).current;

    useEffect(() => {
        const anim = Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: 0,
                delay,
                useNativeDriver: true,
                speed: 14,
                bounciness: 2,
            }),
        ]);
        anim.start();
        return () => anim.stop();
    }, [opacity, translateYAnim, delay, duration]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity,
                    transform: [{ translateY: translateYAnim }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
};
