// ===== Signup Screen (Simplified) =====

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/simple';
import { useAuthStore } from '../../src/store/authStore';

export default function SignupScreen() {
    const { signUp, isLoading, error, clearError } = useAuthStore();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }

        try {
            await signUp(email.trim(), password, name.trim());
            router.replace('/');
        } catch (err) {
            // Error is already set in store
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>👶</Text>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start tracking your baby's day</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Your Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.textMuted}
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (error) clearError();
                            }}
                            autoComplete="name"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textMuted}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) clearError();
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (error) clearError();
                            }}
                            secureTextEntry
                            autoComplete="new-password"
                        />

                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor={colors.textMuted}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (error) clearError();
                            }}
                            secureTextEntry
                            autoComplete="new-password"
                        />

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.signInPrompt}>
                            <Text style={styles.signInText}>Already have an account? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.signInLink}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 32,
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    logo: {
        fontSize: 56,
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    form: {
        flex: 1,
        padding: 24,
        paddingTop: 24,
    },
    errorBanner: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#FEE2E2',
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        color: colors.error,
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
        marginBottom: 16,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    signInPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInText: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    signInLink: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primary,
    },
});
