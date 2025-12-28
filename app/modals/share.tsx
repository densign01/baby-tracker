// ===== Share Baby Modal (Simplified) =====

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
import { useBabyStore } from '../../src/store/babyStore';

export default function ShareBabyModal() {
    const { selectedBaby, invitePartner, isLoading } = useBabyStore();

    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleInvite = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter an email address.');
            return;
        }

        if (!selectedBaby) {
            Alert.alert('Error', 'No baby selected.');
            return;
        }

        try {
            await invitePartner(selectedBaby.id, email.trim());
            setIsSuccess(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to send invitation. Please try again.');
        }
    };

    if (isSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>✅</Text>
                    <Text style={styles.successTitle}>Invitation Sent!</Text>
                    <Text style={styles.successText}>
                        We've sent an invitation to{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Share with Partner</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Premium Note */}
            <View style={styles.premiumNote}>
                <Text style={styles.premiumIcon}>⭐</Text>
                <Text style={styles.premiumText}>
                    This is a premium feature. Upgrade to share baby profiles with your partner.
                </Text>
            </View>

            {/* Email Input */}
            <Text style={styles.label}>Partner's Email</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
            />

            <Text style={styles.helpText}>
                Your partner will receive an email invitation to view and track {selectedBaby?.name || 'your baby'}'s activities.
            </Text>

            {/* Submit */}
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleInvite}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Send Invitation</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cancelText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    premiumNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.primary}15`,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    premiumIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    premiumText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        marginBottom: 12,
    },
    helpText: {
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 20,
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
