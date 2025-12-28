// ===== Input Component (Simplified) =====

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInputProps,
} from 'react-native';
import { colors } from '../../theme/simple';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    secureTextEntry,
    style,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, isFocused && styles.inputFocused, error && styles.inputError]}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeButton}
                    >
                        <Text>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    inputError: {
        borderColor: colors.error,
    },
    input: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: colors.text,
    },
    eyeButton: {
        padding: 16,
        paddingLeft: 0,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
});
