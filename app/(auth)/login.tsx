// ===== Login Screen =====

import React, { useState, useEffect } from 'react';
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
import * as AppleAuthentication from 'expo-apple-authentication';
import { colors, gradients } from '../../src/theme/simple';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
    const { signIn, signInWithApple, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

    useEffect(() => {
        AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }

        try {
            await signIn(email.trim(), password);
            router.replace('/');
        } catch (err) {
            // Error is already set in store
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await signInWithApple();
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
                        <Text style={styles.logo}>😴</Text>
                        <Text style={styles.title}>Swaddle</Text>
                        <Text style={styles.subtitle}>Welcome back!</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

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
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (error) clearError();
                            }}
                            secureTextEntry
                            autoComplete="password"
                        />

                        <TouchableOpacity
                            onPress={() => router.push('/(auth)/forgot-password')}
                            style={styles.forgotPassword}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {appleAuthAvailable && (
                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                cornerRadius={12}
                                style={styles.appleButton}
                                onPress={handleAppleSignIn}
                            />
                        )}

                        <View style={styles.signUpPrompt}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <Link href="/(auth)/signup" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.signUpLink}>Sign Up</Text>
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
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    form: {
        flex: 1,
        padding: 24,
        paddingTop: 32,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: -8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
        color: colors.textMuted,
    },
    appleButton: {
        width: '100%',
        height: 50,
    },
    appleButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
    },
    signUpPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    signUpText: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    signUpLink: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primary,
    },
});
