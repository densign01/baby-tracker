// ===== Entry Point - Auth Check =====

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '../src/theme/simple';
import { useAuthStore } from '../src/store/authStore';
import { useBabyStore } from '../src/store/babyStore';

export default function Index() {
    const { user, isInitialized, isLoading: authLoading } = useAuthStore();
    const { babies, isLoading: babiesLoading, subscribeToBabies } = useBabyStore();
    const [babiesChecked, setBabiesChecked] = useState(false);

    // Subscribe to babies when user is available
    useEffect(() => {
        if (user?.id) {
            setBabiesChecked(false);
            const unsubscribe = subscribeToBabies(user.id);

            // Give Firebase a moment to load babies, then mark as checked
            const timer = setTimeout(() => {
                setBabiesChecked(true);
            }, 1500);

            return () => {
                unsubscribe();
                clearTimeout(timer);
            };
        } else {
            setBabiesChecked(true); // No user, no need to wait for babies
        }
    }, [user?.id]);

    // Show loading while checking auth state
    if (!isInitialized || authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingIcon}>🍼</Text>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    // Wait for babies to load before deciding
    if (babiesLoading || !babiesChecked) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingIcon}>🍼</Text>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading profiles...</Text>
            </View>
        );
    }

    // If user has no babies, redirect to setup
    if (babies.length === 0) {
        return <Redirect href="/baby/setup" />;
    }

    // User is authenticated and has a baby, go to main app
    return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.textSecondary,
    },
});
