/**
 * PressableScale — Pressable with spring scale animation on press.
 * Equivalent to Framer Motion's whileTap={{ scale: 0.97 }}.
 * Uses React Native's built-in Animated API — zero extra dependencies.
 */

import React, { useRef, useCallback } from 'react';
import {
    Animated,
    Pressable,
    type PressableProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

type PressableScaleProps = PressableProps & {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleValue?: number;
};

export const PressableScale: React.FC<PressableScaleProps> = ({
    children,
    style,
    scaleValue = 0.97,
    onPress,
    onLongPress,
    disabled,
    accessibilityLabel,
    accessibilityRole,
    hitSlop,
    ...rest
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = useCallback(() => {
        Animated.spring(scale, {
            toValue: scaleValue,
            useNativeDriver: true,
            speed: 50,
            bounciness: 2,
        }).start();
    }, [scale, scaleValue]);

    const onPressOut = useCallback(() => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 4,
        }).start();
    }, [scale]);

    return (
        <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole}
            hitSlop={hitSlop}
            {...rest}
        >
            <Animated.View style={[style, { transform: [{ scale }] }]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
