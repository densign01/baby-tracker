// ===== Action Card Component (Simplified) =====

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, gradients } from '../theme/simple';
import type { ActivityType } from '../types';

interface ActionCardProps {
    type: ActivityType | 'pee' | 'poop';
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    isActive?: boolean;
    activeTimer?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    type,
    title,
    subtitle,
    icon,
    onPress,
    isActive = false,
    activeTimer,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.card, isActive && styles.cardActive]}
            activeOpacity={0.8}
        >
            {isActive && activeTimer && (
                <View style={styles.timerBadge}>
                    <Text style={styles.timerText}>{activeTimer}</Text>
                </View>
            )}
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 20,
        position: 'relative',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardActive: {
        backgroundColor: `${colors.primary}15`,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    timerBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    icon: {
        fontSize: 36,
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textMuted,
    },
});
