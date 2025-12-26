// ===== Feeding Modal =====

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/simple';
import { useBabyStore } from '../../src/store/babyStore';
import { useActivityStore } from '../../src/store/activityStore';
import { useAuthStore } from '../../src/store/authStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import type { FeedingType, FeedingSide } from '../../src/types';

type BottleContentType = 'breast_milk' | 'formula';

export default function FeedingModal() {
    const { user } = useAuthStore();
    const { selectedBaby } = useBabyStore();
    const { logFeeding, isLoading } = useActivityStore();
    const { feedingPreferences, setFeedingPreferences } = useSettingsStore();

    const [feedingType, setFeedingType] = useState<FeedingType | null>(null);
    const [breastSide, setBreastSide] = useState<FeedingSide>('left');
    const [bottleContent, setBottleContent] = useState<BottleContentType>(
        feedingPreferences.lastBottleContent || 'breast_milk'
    );
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    // Filter feeding types based on preferences
    const allFeedingTypes: { key: FeedingType; label: string; icon: string; pref: keyof typeof feedingPreferences }[] = [
        { key: 'breast', label: 'Nursing', icon: '🤱', pref: 'showBreast' },
        { key: 'bottle', label: 'Bottle', icon: '🍼', pref: 'showBottle' },
        { key: 'solid', label: 'Solid', icon: '🥣', pref: 'showSolid' },
    ];

    const feedingTypes = allFeedingTypes.filter(t => feedingPreferences[t.pref]);

    // Auto-select if only one option
    React.useEffect(() => {
        if (feedingTypes.length === 1 && feedingType === null) {
            setFeedingType(feedingTypes[0].key);
        }
    }, [feedingTypes, feedingType]);

    const handleSubmit = async () => {
        if (!selectedBaby || !user) {
            Alert.alert('Error', 'Missing baby or user information.');
            return;
        }

        if (!feedingType) {
            Alert.alert('Error', 'Please select a feeding type.');
            return;
        }

        try {
            // Build notes with bottle content type if bottle
            let finalNotes = notes.trim();
            if (feedingType === 'bottle') {
                // Save the bottle content preference for next time
                setFeedingPreferences({ lastBottleContent: bottleContent });
                const contentLabel = bottleContent === 'breast_milk' ? 'Breast milk' : 'Formula';
                finalNotes = finalNotes ? `${contentLabel} - ${finalNotes}` : contentLabel;
            }

            await logFeeding({
                babyId: selectedBaby.id,
                userId: user.id,
                userName: user.displayName,
                feedingType,
                feedingSide: feedingType === 'breast' ? breastSide : null,
                bottleAmount: feedingType === 'bottle' ? parseFloat(amount) || null : null,
                notes: finalNotes || undefined,
            });
            Alert.alert('Success', 'Feeding logged!');
            router.back();
        } catch (error) {
            console.error('Feeding error:', error);
            Alert.alert('Error', 'Failed to log feeding.');
        }
    };

    // Show message if all feeding types are hidden
    if (feedingTypes.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Log Feeding</Text>
                    <View style={{ width: 60 }} />
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>⚙️</Text>
                    <Text style={styles.emptyText}>No feeding types enabled</Text>
                    <Text style={styles.emptySubtext}>Go to Settings → Feeding Options to enable feeding types</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Log Feeding</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Feeding Type - only show if more than one option */}
                {feedingTypes.length > 1 && (
                    <>
                        <Text style={styles.label}>Feeding Type</Text>
                        <View style={styles.typeOptions}>
                            {feedingTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.key}
                                    style={[
                                        styles.typeOption,
                                        feedingType === type.key && styles.typeOptionSelected,
                                    ]}
                                    onPress={() => setFeedingType(type.key)}
                                >
                                    <Text style={styles.typeIcon}>{type.icon}</Text>
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            feedingType === type.key && styles.typeLabelSelected,
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Breast Side */}
                {feedingType === 'breast' && (
                    <>
                        <Text style={styles.label}>Side</Text>
                        <View style={styles.sideOptions}>
                            {(['left', 'right', 'both'] as FeedingSide[]).map((side) => (
                                <TouchableOpacity
                                    key={side}
                                    style={[
                                        styles.sideOption,
                                        breastSide === side && styles.sideOptionSelected,
                                    ]}
                                    onPress={() => setBreastSide(side)}
                                >
                                    <Text
                                        style={[
                                            styles.sideLabel,
                                            breastSide === side && styles.sideLabelSelected,
                                        ]}
                                    >
                                        {side.charAt(0).toUpperCase() + side.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Bottle Options */}
                {feedingType === 'bottle' && (
                    <>
                        <Text style={styles.label}>Contents</Text>
                        <View style={styles.sideOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.sideOption,
                                    bottleContent === 'breast_milk' && styles.sideOptionSelected,
                                ]}
                                onPress={() => setBottleContent('breast_milk')}
                            >
                                <Text style={styles.contentIcon}>🤱</Text>
                                <Text
                                    style={[
                                        styles.sideLabel,
                                        bottleContent === 'breast_milk' && styles.sideLabelSelected,
                                    ]}
                                >
                                    Breast Milk
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sideOption,
                                    bottleContent === 'formula' && styles.sideOptionSelected,
                                ]}
                                onPress={() => setBottleContent('formula')}
                            >
                                <Text style={styles.contentIcon}>🍼</Text>
                                <Text
                                    style={[
                                        styles.sideLabel,
                                        bottleContent === 'formula' && styles.sideLabelSelected,
                                    ]}
                                >
                                    Formula
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Amount (oz)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor={colors.textMuted}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />
                    </>
                )}

                {/* Notes */}
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Add notes..."
                    placeholderTextColor={colors.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.button, (isLoading || !feedingType) && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading || !feedingType}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Log Feeding</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        marginTop: 16,
    },
    typeOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    typeOption: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    typeIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    typeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    typeLabelSelected: {
        color: colors.primary,
    },
    sideOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    sideOption: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    sideOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    contentIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    sideLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    sideLabelSelected: {
        color: colors.primary,
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
    },
    notesInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
