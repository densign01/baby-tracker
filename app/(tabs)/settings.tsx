// ===== Settings Screen =====

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    TextInput,
    Switch,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../src/theme/simple';
import { useAuthStore } from '../../src/store/authStore';
import { useBabyStore } from '../../src/store/babyStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';
import PremiumUpgradeModal from '../modals/premium';

export default function SettingsScreen() {
    const { user, signOut, deleteAccount, isLoading } = useAuthStore();
    const { selectedBaby, updateBaby } = useBabyStore();
    const { feedingPreferences, setFeedingPreferences } = useSettingsStore();
    const { isPremium, canShareWithPartner } = useSubscriptionStore();

    const [showEditBabyModal, setShowEditBabyModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editGender, setEditGender] = useState<'boy' | 'girl' | 'neutral'>('neutral');
    const [editBirthday, setEditBirthday] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleEditBaby = () => {
        setEditName(selectedBaby?.name || '');
        setEditGender(selectedBaby?.gender || 'neutral');
        setEditBirthday(selectedBaby?.birthDate || null);
        setShowEditBabyModal(true);
    };

    const handleSaveBaby = async () => {
        if (!selectedBaby) return;

        try {
            await updateBaby(selectedBaby.id, {
                name: editName || 'Baby',
                gender: editGender,
                birthDate: editBirthday || undefined,
            });
            setShowEditBabyModal(false);
            Alert.alert('Saved', 'Baby profile updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update baby profile.');
        }
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return 'Not set';
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirm Deletion',
                            'This is your final warning. Your account and all data will be permanently deleted.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete Forever',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await deleteAccount();
                                            router.replace('/(auth)/login');
                                        } catch (error) {
                                            Alert.alert('Error', 'Failed to delete account. Please try again.');
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const handleUpgrade = () => {
        setShowPremiumModal(true);
    };

    const handleShare = () => {
        if (!canShareWithPartner) {
            setShowPremiumModal(true);
            return;
        }
        router.push('/modals/share');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Settings</Text>

                {/* Baby Profile */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Baby Profile</Text>
                    <TouchableOpacity style={styles.babyCard} onPress={handleEditBaby}>
                        {selectedBaby?.photoUrl ? (
                            <Image source={{ uri: selectedBaby.photoUrl }} style={styles.babyPhoto} />
                        ) : (
                            <View style={styles.babyPhotoPlaceholder}>
                                <Text style={styles.babyPhotoEmoji}>👶</Text>
                            </View>
                        )}
                        <View style={styles.babyInfo}>
                            <Text style={styles.babyName}>{selectedBaby?.name || 'Baby'}</Text>
                            <Text style={styles.babyAge}>
                                {selectedBaby?.gender === 'boy' ? '👦 Boy' :
                                    selectedBaby?.gender === 'girl' ? '👧 Girl' : '👶 Baby'}
                            </Text>
                        </View>
                        <Text style={styles.editArrow}>✏️</Text>
                    </TouchableOpacity>
                </View>

                {/* Premium */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Premium</Text>
                    {isPremium ? (
                        <View style={[styles.premiumCard, { backgroundColor: colors.accent }]}>
                            <Text style={styles.premiumIcon}>✓</Text>
                            <View style={styles.premiumContent}>
                                <Text style={styles.premiumTitle}>Premium Active</Text>
                                <Text style={styles.premiumSubtitle}>All features unlocked</Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.premiumCard} onPress={handleUpgrade}>
                            <Text style={styles.premiumIcon}>⭐</Text>
                            <View style={styles.premiumContent}>
                                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                                <Text style={styles.premiumSubtitle}>Unlock all features</Text>
                            </View>
                            <Text style={styles.arrow}>→</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.settingItem} onPress={handleShare}>
                        <Text style={styles.settingIcon}>👨‍👩‍👧</Text>
                        <Text style={styles.settingLabel}>Share with Partner</Text>
                        {!canShareWithPartner && (
                            <View style={styles.premiumBadge}>
                                <Text style={styles.premiumBadgeText}>PRO</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Feeding Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Feeding Options</Text>
                    <View style={styles.card}>
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleIcon}>🤱</Text>
                            <Text style={styles.toggleLabel}>Show Nursing</Text>
                            <Switch
                                value={feedingPreferences.showBreast}
                                onValueChange={(value) => setFeedingPreferences({ showBreast: value })}
                                trackColor={{ false: colors.border, true: colors.primary }}
                            />
                        </View>
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleIcon}>🍼</Text>
                            <Text style={styles.toggleLabel}>Show Bottle</Text>
                            <Switch
                                value={feedingPreferences.showBottle}
                                onValueChange={(value) => setFeedingPreferences({ showBottle: value })}
                                trackColor={{ false: colors.border, true: colors.primary }}
                            />
                        </View>
                        <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.toggleIcon}>🥣</Text>
                            <Text style={styles.toggleLabel}>Show Solid Food</Text>
                            <Switch
                                value={feedingPreferences.showSolid}
                                onValueChange={(value) => setFeedingPreferences({ showSolid: value })}
                                trackColor={{ false: colors.border, true: colors.primary }}
                            />
                        </View>
                    </View>
                </View>

                {/* Account */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.accountCard}>
                        <Text style={styles.accountIcon}>👤</Text>
                        <View style={styles.accountInfo}>
                            <Text style={styles.accountName}>{user?.displayName || 'User'}</Text>
                            <Text style={styles.accountEmail}>{user?.email}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteAccountButton}
                        onPress={handleDeleteAccount}
                        disabled={isLoading}
                    >
                        <Text style={styles.deleteAccountText}>
                            {isLoading ? 'Deleting...' : 'Delete Account'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Baby Modal */}
            <Modal
                visible={showEditBabyModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditBabyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowEditBabyModal(false)}
                    />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Baby</Text>

                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Baby's name"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.genderOptions}>
                            {(['boy', 'girl', 'neutral'] as const).map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.genderOption, editGender === g && styles.genderOptionActive]}
                                    onPress={() => setEditGender(g)}
                                >
                                    <Text style={styles.genderEmoji}>
                                        {g === 'boy' ? '👦' : g === 'girl' ? '👧' : '👶'}
                                    </Text>
                                    <Text style={[styles.genderLabel, editGender === g && styles.genderLabelActive]}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Birthday</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>🎂 {formatDate(editBirthday)}</Text>
                        </TouchableOpacity>

                        {showDatePicker && Platform.OS === 'ios' && (
                            <Modal transparent animationType="fade">
                                <View style={styles.datePickerOverlay}>
                                    <View style={styles.datePickerModal}>
                                        <DateTimePicker
                                            value={editBirthday || new Date()}
                                            mode="date"
                                            display="spinner"
                                            maximumDate={new Date()}
                                            onChange={(event, date) => {
                                                if (date) setEditBirthday(date);
                                            }}
                                        />
                                        <View style={styles.datePickerButtons}>
                                            <TouchableOpacity
                                                style={styles.datePickerCancel}
                                                onPress={() => setShowDatePicker(false)}
                                            >
                                                <Text style={styles.datePickerCancelText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.datePickerDone}
                                                onPress={() => setShowDatePicker(false)}
                                            >
                                                <Text style={styles.datePickerDoneText}>Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {showDatePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={editBirthday || new Date()}
                                mode="date"
                                maximumDate={new Date()}
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setEditBirthday(date);
                                }}
                            />
                        )}

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveBaby}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowEditBabyModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Premium Upgrade Modal */}
            <PremiumUpgradeModal
                visible={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
            />
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
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    babyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
    },
    babyPhoto: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
    },
    babyPhotoPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    babyPhotoEmoji: {
        fontSize: 28,
    },
    babyInfo: {
        flex: 1,
    },
    babyName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    babyAge: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    editArrow: {
        fontSize: 18,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        overflow: 'hidden',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    toggleIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    toggleLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    premiumCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    premiumIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    premiumContent: {
        flex: 1,
    },
    premiumTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    premiumSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    arrow: {
        fontSize: 18,
        color: '#FFFFFF',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    settingIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    premiumBadge: {
        backgroundColor: `${colors.primary}20`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    premiumBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    accountIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    accountEmail: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    signOutButton: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
    },
    deleteAccountButton: {
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    deleteAccountText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
        opacity: 0.7,
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
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.text,
        marginBottom: 16,
    },
    genderOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    genderOption: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    genderOptionActive: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    genderEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    genderLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    genderLabelActive: {
        color: colors.primary,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalCancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    dateButton: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    dateButtonText: {
        fontSize: 16,
        color: colors.text,
    },
    datePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    datePickerModal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
    },
    datePickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    datePickerCancel: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    datePickerCancelText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    datePickerDone: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    datePickerDoneText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
});
