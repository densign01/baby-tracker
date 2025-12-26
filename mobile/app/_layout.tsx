// ===== Root Layout =====

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        const unsubscribe = initialize();
        return () => unsubscribe();
    }, []);

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="baby/setup" options={{ presentation: 'modal' }} />
                <Stack.Screen name="modals/feeding" options={{ presentation: 'modal' }} />
                <Stack.Screen name="modals/share" options={{ presentation: 'modal' }} />
            </Stack>
        </>
    );
}
