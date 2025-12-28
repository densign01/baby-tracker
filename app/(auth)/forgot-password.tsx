// ===== Forgot Password Screen (Simplified) =====

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/simple';
import { useAuthStore } from '../../src/store/authStore';

export default function ForgotPasswordScreen() {
    const { resetPassword, isLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleReset = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        try {
            await resetPassword(email.trim());
            setIsSent(true);
        } catch (err) {
            Alert.alert('Error', 'Failed to send reset email. Please try again.');
        }
    };

    if (isSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>✉️</Text>
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successText}>
                        We've sent a password reset link to{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Back button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email and we'll send you a link to reset your password.
                </Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleReset}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 24,
    },
    backText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        marginBottom: 24,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
    },
    successText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emailText: {
        fontWeight: '700',
        color: colors.text,
    },
});
