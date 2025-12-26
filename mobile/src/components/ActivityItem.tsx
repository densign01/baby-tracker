// ===== Activity Item Component (Simplified) =====

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/simple';
import type { Activity, ActivityType } from '../types';

interface ActivityItemProps {
    activity: Activity;
    onPress?: () => void;
    onLongPress?: () => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({
    activity,
    onPress,
    onLongPress,
}) => {
    const getIcon = (type: ActivityType): string => {
        switch (type) {
            case 'sleep': return '😴';
            case 'feeding': return '🍼';
            case 'diaper': return '👶';
            default: return '📝';
        }
    };

    const getDetails = (): string => {
        switch (activity.type) {
            case 'sleep':
                if (activity.duration) {
                    const hours = Math.floor(activity.duration / 60);
                    const minutes = activity.duration % 60;
                    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                }
                return 'In progress...';
            case 'feeding':
                const feeding = activity as any;
                if (feeding.feedingType === 'breast') {
                    return `Breast (${feeding.breastSide})`;
                } else if (feeding.feedingType === 'bottle') {
                    return `Bottle - ${feeding.amount}oz`;
                } else {
                    return 'Solid food';
                }
            case 'diaper':
                const diaper = activity as any;
                return diaper.diaperType === 'wet' ? '💧 Wet' : '💩 Dirty';
            default:
                return '';
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon(activity.type)}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.type}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </Text>
                <Text style={styles.details}>{getDetails()}</Text>
            </View>
            <Text style={styles.time}>{formatTime(activity.startTime)}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
    },
    content: {
        flex: 1,
    },
    type: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    details: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    time: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: '500',
    },
});
