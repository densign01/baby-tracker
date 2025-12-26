// ===== Summary Card Component (Simplified) =====

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/simple';

interface SummaryCardProps {
    icon: string;
    value: string | number;
    label: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    icon,
    value,
    label,
}) => {
    return (
        <View style={styles.card}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        fontSize: 24,
        marginBottom: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
    },
});
