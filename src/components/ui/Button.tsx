// ===== Button Component (Simplified) =====

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import { colors } from '../../theme/simple';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    style,
}) => {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: colors.primary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.border,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    size_sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    size_md: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    size_lg: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontWeight: '600',
    },
    text_primary: {
        color: '#FFFFFF',
    },
    text_outline: {
        color: colors.text,
    },
    text_ghost: {
        color: colors.primary,
    },
    text_sm: {
        fontSize: 14,
    },
    text_md: {
        fontSize: 16,
    },
    text_lg: {
        fontSize: 17,
    },
});
