// ===== Tabs Layout (Simplified) =====

import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/simple';
import { useBabyStore } from '../../src/store/babyStore';
import { useActivityStore } from '../../src/store/activityStore';
import { useAuthStore } from '../../src/store/authStore';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
    return (
        <View style={styles.tabItem}>
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
        </View>
    );
}

export default function TabsLayout() {
    const { user } = useAuthStore();
    const { selectedBaby, subscribeToBabies } = useBabyStore();
    const { subscribeToActivities } = useActivityStore();

    // Subscribe to babies when user is available
    useEffect(() => {
        if (user?.id) {
            const unsubBabies = subscribeToBabies(user.id);
            return () => unsubBabies();
        }
    }, [user?.id]);

    // Subscribe to activities when baby is selected
    useEffect(() => {
        if (selectedBaby?.id) {
            const unsubActivities = subscribeToActivities(selectedBaby.id);
            return () => unsubActivities();
        }
    }, [selectedBaby?.id]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                    height: 85,
                    paddingTop: 8,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🏠" label="Home" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📋" label="Daily" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="⚙️" label="Settings" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 2,
        opacity: 0.5,
    },
    tabIconActive: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.textMuted,
        textAlign: 'center',
    },
    tabLabelActive: {
        color: colors.primary,
    },
});
