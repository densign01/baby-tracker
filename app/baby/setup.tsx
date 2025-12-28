// ===== Baby Profile Setup Screen (Simplified) =====

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../src/theme/simple';
import { useAuthStore } from '../../src/store/authStore';
import { useBabyStore } from '../../src/store/babyStore';
import type { Gender } from '../../src/types';

export default function BabySetupScreen() {
    const { user } = useAuthStore();
    const { createBaby, isLoading } = useBabyStore();

    const [name, setName] = useState('');
    const [gender, setGender] = useState<Gender>('neutral');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [tempDate, setTempDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
                setBirthDate(selectedDate);
            }
        } else if (selectedDate) {
            setTempDate(selectedDate);
        }
    };

    const handleDateConfirm = () => {
        setBirthDate(tempDate);
        setShowDatePicker(false);
    };

    const handleDateCancel = () => {
        setTempDate(birthDate || new Date());
        setShowDatePicker(false);
    };

    const openDatePicker = () => {
        setTempDate(birthDate || new Date());
        setShowDatePicker(true);
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in.');
            return;
        }

        try {
            await createBaby(
                {
                    name: name.trim() || undefined,
                    gender,
                    birthDate: birthDate || undefined,
                    ownerId: user.id,
                },
                photoUri || undefined
            );
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to create baby profile. Please try again.');
        }
    };

    const genderOptions: { key: Gender; label: string; emoji: string }[] = [
        { key: 'boy', label: 'Boy', emoji: '👦' },
        { key: 'girl', label: 'Girl', emoji: '👧' },
        { key: 'neutral', label: 'Prefer not to say', emoji: '👶' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome! 👶</Text>
                    <Text style={styles.subtitle}>Let's set up your baby's profile</Text>
                    <Text style={styles.hint}>All fields are optional</Text>
                </View>

                {/* Photo */}
                <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoIcon}>📷</Text>
                            <Text style={styles.photoText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Name Input */}
                <Text style={styles.label}>Baby's Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter baby's name (optional)"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                />

                {/* Birthday */}
                <Text style={styles.label}>Birthday</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={openDatePicker}
                >
                    <Text style={birthDate ? styles.dateText : styles.datePlaceholder}>
                        {birthDate ? formatDate(birthDate) : 'Select birthday (optional)'}
                    </Text>
                </TouchableOpacity>

                {/* iOS Date Picker Modal */}
                {Platform.OS === 'ios' && (
                    <Modal
                        visible={showDatePicker}
                        transparent
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={handleDateCancel}>
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Select Birthday</Text>
                                    <TouchableOpacity onPress={handleDateConfirm}>
                                        <Text style={styles.modalDoneText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    style={styles.datePicker}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Android Date Picker */}
                {Platform.OS === 'android' && showDatePicker && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {/* Gender Selection */}
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderOptions}>
                    {genderOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.genderOption,
                                gender === option.key && styles.genderOptionSelected,
                            ]}
                            onPress={() => setGender(option.key)}
                        >
                            <Text style={styles.genderEmoji}>{option.emoji}</Text>
                            <Text
                                style={[
                                    styles.genderLabel,
                                    gender === option.key && styles.genderLabelSelected,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Continue</Text>
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
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    hint: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 8,
        fontStyle: 'italic',
    },
    photoContainer: {
        alignSelf: 'center',
        marginBottom: 32,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    photoText: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: '500',
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
    dateButton: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    dateText: {
        fontSize: 16,
        color: colors.text,
    },
    datePlaceholder: {
        fontSize: 16,
        color: colors.textMuted,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text,
    },
    modalCancelText: {
        fontSize: 17,
        color: colors.textSecondary,
    },
    modalDoneText: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.primary,
    },
    datePicker: {
        height: 200,
    },
    genderOptions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    genderOption: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    genderOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    genderEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    genderLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    genderLabelSelected: {
        color: colors.primary,
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
});
