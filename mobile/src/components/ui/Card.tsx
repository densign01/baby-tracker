// ===== Card Component (Simplified) =====

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, shadow } from '../../theme/simple';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    elevation?: 'sm' | 'md';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    onPress,
    elevation = 'sm',
}) => {
    const cardStyles = [
        styles.card,
        shadow[elevation],
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
    },
});
