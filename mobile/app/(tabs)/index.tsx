// ===== Home Screen =====

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/simple';
import { useBabyStore } from '../../src/store/babyStore';
import { useActivityStore } from '../../src/store/activityStore';
import { useAuthStore } from '../../src/store/authStore';

type DiaperType = 'pee' | 'poop' | 'both';

export default function HomeScreen() {
    const { user } = useAuthStore();
    const { selectedBaby } = useBabyStore();
    const { logSleep, logDiaper, getDailySummary } = useActivityStore();

    const [showDiaperModal, setShowDiaperModal] = useState(false);
    const [showSleepModal, setShowSleepModal] = useState(false);
    const [sleepHours, setSleepHours] = useState('');
    const [sleepMinutes, setSleepMinutes] = useState('');
    const dailySummary = getDailySummary();

    // Format current date
    const formatCurrentDate = (): string => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSleepPress = () => {
        setSleepHours('');
        setSleepMinutes('');
        setShowSleepModal(true);
    };

    const handleSleepLog = async () => {
        if (!selectedBaby || !user) return;

        const hours = parseInt(sleepHours) || 0;
        const minutes = parseInt(sleepMinutes) || 0;
        const durationMs = (hours * 60 + minutes) * 60 * 1000;

        if (durationMs === 0) {
            Alert.alert('Invalid Duration', 'Please enter a valid sleep duration.');
            return;
        }

        setShowSleepModal(false);

        try {
            await logSleep({
                babyId: selectedBaby.id,
                userId: user.id,
                userName: user.displayName,
                durationMs,
            });
            Alert.alert('Logged', `Sleep logged: ${hours}h ${minutes}m`);
        } catch (error) {
            console.error('Sleep error:', error);
            Alert.alert('Error', 'Failed to log sleep.');
        }
    };

    const handleFeedingPress = () => {
        router.push('/modals/feeding');
    };

    const handleDiaperPress = () => {
        setShowDiaperModal(true);
    };

    const handleDiaperLog = async (diaperType: DiaperType) => {
        if (!selectedBaby || !user) return;

        setShowDiaperModal(false);

        try {
            await logDiaper({
                babyId: selectedBaby.id,
                userId: user.id,
                userName: user.displayName,
                diaperType,
            });

            const typeLabel = diaperType === 'pee' ? 'Wet' : diaperType === 'poop' ? 'Dirty' : 'Wet + Dirty';
            Alert.alert('Logged', `${typeLabel} diaper logged!`);
        } catch (error) {
            console.error('Diaper error:', error);
            Alert.alert('Error', 'Failed to log diaper.');
        }
    };

    // Format sleep time from milliseconds
    const formatSleepTime = (ms: number): string => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const babyName = selectedBaby?.name || 'Baby';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.date}>{formatCurrentDate()}</Text>
                    <Text style={styles.babyName}>{babyName}'s Day</Text>
                </View>

                {/* Action Cards */}
                <View style={styles.cardsRow}>
                    {/* Sleep Card */}
                    <TouchableOpacity style={styles.card} onPress={handleSleepPress}>
                        <Text style={styles.cardIcon}>😴</Text>
                        <Text style={styles.cardTitle}>Sleep</Text>
                        <Text style={styles.cardSubtitle}>Log a nap</Text>
                    </TouchableOpacity>

                    {/* Feeding Card */}
                    <TouchableOpacity style={styles.card} onPress={handleFeedingPress}>
                        <Text style={styles.cardIcon}>🍼</Text>
                        <Text style={styles.cardTitle}>Feeding</Text>
                        <Text style={styles.cardSubtitle}>Log a feeding</Text>
                    </TouchableOpacity>
                </View>

                {/* Diaper Card - Full Width */}
                <TouchableOpacity
                    style={[styles.card, styles.diaperCard]}
                    onPress={handleDiaperPress}
                >
                    <Text style={styles.cardIcon}>👶</Text>
                    <Text style={styles.cardTitle}>Diaper</Text>
                    <Text style={styles.cardSubtitle}>Log a diaper change</Text>
                </TouchableOpacity>

                {/* Today's Summary */}
                <Text style={styles.sectionTitle}>Today's Summary</Text>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryIcon}>😴</Text>
                        <Text style={styles.summaryValue}>{formatSleepTime(dailySummary.totalSleepMs)}</Text>
                        <Text style={styles.summaryLabel}>Sleep</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryIcon}>🍼</Text>
                        <Text style={styles.summaryValue}>{dailySummary.feedingCount}</Text>
                        <Text style={styles.summaryLabel}>Feedings</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryIcon}>👶</Text>
                        <Text style={styles.summaryValue}>{dailySummary.diaperCount}</Text>
                        <Text style={styles.summaryLabel}>Diapers</Text>
                        <Text style={styles.summaryBreakdown}>
                            💧{dailySummary.wetDiaperCount} 💩{dailySummary.dirtyDiaperCount}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sleep Modal */}
            <Modal
                visible={showSleepModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSleepModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowSleepModal(false)}
                    />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Sleep</Text>
                        <Text style={styles.modalSubtitle}>How long did baby sleep?</Text>

                        <View style={styles.durationInputs}>
                            <View style={styles.durationInput}>
                                <TextInput
                                    style={styles.durationTextInput}
                                    placeholder="0"
                                    placeholderTextColor={colors.textMuted}
                                    value={sleepHours}
                                    onChangeText={setSleepHours}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />
                                <Text style={styles.durationLabel}>hours</Text>
                            </View>

                            <View style={styles.durationInput}>
                                <TextInput
                                    style={styles.durationTextInput}
                                    placeholder="0"
                                    placeholderTextColor={colors.textMuted}
                                    value={sleepMinutes}
                                    onChangeText={setSleepMinutes}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />
                                <Text style={styles.durationLabel}>minutes</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.logButton} onPress={handleSleepLog}>
                            <Text style={styles.logButtonText}>Log Sleep</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowSleepModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Diaper Modal */}
            <Modal
                visible={showDiaperModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDiaperModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowDiaperModal(false)}
                    />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Diaper</Text>
                        <Text style={styles.modalSubtitle}>Select diaper type</Text>

                        <View style={styles.diaperOptions}>
                            <TouchableOpacity
                                style={styles.diaperOption}
                                onPress={() => handleDiaperLog('pee')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.diaperOptionIcon}>💧</Text>
                                <Text style={styles.diaperOptionLabel}>Wet</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.diaperOption}
                                onPress={() => handleDiaperLog('poop')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.diaperOptionIcon}>💩</Text>
                                <Text style={styles.diaperOptionLabel}>Dirty</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.diaperOption}
                                onPress={() => handleDiaperLog('both')}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.diaperOptionIcon}>💧💩</Text>
                                <Text style={styles.diaperOptionLabel}>Both</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowDiaperModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    date: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    babyName: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    diaperCard: {
        marginBottom: 12,
    },
    cardIcon: {
        fontSize: 36,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginTop: 16,
        marginBottom: 12,
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.textMuted,
    },
    summaryBreakdown: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 20,
    },
    durationInputs: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 20,
    },
    durationInput: {
        alignItems: 'center',
    },
    durationTextInput: {
        width: 80,
        height: 60,
        backgroundColor: colors.background,
        borderRadius: 12,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        color: colors.text,
        marginBottom: 8,
    },
    durationLabel: {
        fontSize: 14,
        color: colors.textMuted,
    },
    logButton: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 8,
    },
    logButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    diaperOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    diaperOption: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.background,
        borderRadius: 12,
        minWidth: 80,
    },
    diaperOptionIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    diaperOptionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    modalCancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    modalCancelText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
