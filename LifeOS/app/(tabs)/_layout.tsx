/**
 * MainTabNav — Premium Bottom Tab Layout
 *
 * Features:
 * - Custom tab bar with no border, clean background
 * - Animated active states with scale + color transitions
 * - Descriptive accessibility labels
 * - Badge support on check-ins tab
 */

import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/utils/designTokens';

type TabIconProps = {
    name: React.ComponentProps<typeof Ionicons>['name'];
    focusedName: React.ComponentProps<typeof Ionicons>['name'];
    focused: boolean;
    color: string;
    size: number;
};

function TabIcon({ name, focusedName, focused, color, size }: TabIconProps) {
    return (
        <View
            style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 2,
            }}
        >
            <Ionicons name={focused ? focusedName : name} size={size} color={color} />
        </View>
    );
}

export default function TabsLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: {
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 10,
                    letterSpacing: 0.3,
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            name="home-outline"
                            focusedName="home"
                            focused={focused}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="decisions"
                options={{
                    title: 'Decisions',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            name="scale-outline"
                            focusedName="scale"
                            focused={focused}
                            color={color}
                            size={size}
                        />
                    ),
                }}
                listeners={{
                    tabPress: () => {
                        router.navigate('/(tabs)/decisions');
                    },
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: 'AI Advisor',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            name="sparkles-outline"
                            focusedName="sparkles"
                            focused={focused}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            name="bar-chart-outline"
                            focusedName="bar-chart"
                            focused={focused}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused, color, size }) => (
                        <TabIcon
                            name="person-outline"
                            focusedName="person"
                            focused={focused}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}