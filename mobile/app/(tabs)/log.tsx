// ===== Activity Log Screen (Daily View) =====

import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/simple';
import { useActivityStore } from '../../src/store/activityStore';
import type { Activity, DiaperActivity, FeedingActivity, SleepActivity } from '../../src/types';

type FilterType = 'all' | 'sleep' | 'feeding' | 'diaper';

export default function LogScreen() {
    const { activities, deleteActivity, getDailySummary } = useActivityStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState<FilterType>('all');

    // Helper to normalize activity type (handle legacy pee/poop types)
    const getActivityType = (activity: Activity): string => {
        const type = (activity as any).type;
        if (type === 'pee' || type === 'poop') return 'diaper';
        return type;
    };

    // Get activities for selected date
    const dayActivities = useMemo(() => {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        let filtered = activities.filter(a => {
            const activityDate = new Date(a.timestamp);
            return activityDate >= startOfDay && activityDate <= endOfDay;
        });

        if (filter !== 'all') {
            filtered = filtered.filter(a => getActivityType(a) === filter);
        }

        // Sort by time, newest first
        return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [activities, selectedDate, filter]);

    // Calculate daily summary for selected date
    const dailyStats = useMemo(() => {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dayActs = activities.filter(a => {
            const activityDate = new Date(a.timestamp);
            return activityDate >= startOfDay && activityDate <= endOfDay;
        });

        const sleepActs = dayActs.filter(a => a.type === 'sleep') as SleepActivity[];
        const feedingActs = dayActs.filter(a => a.type === 'feeding') as FeedingActivity[];
        // Handle both new 'diaper' type and legacy 'pee'/'poop' types
        const diaperActs = dayActs.filter(a =>
            a.type === 'diaper' || (a as any).type === 'pee' || (a as any).type === 'poop'
        );

        const totalSleepMs = sleepActs.reduce((sum, a) => sum + (a.duration || 0), 0);

        let wetCount = 0;
        let dirtyCount = 0;
        diaperActs.forEach((d: any) => {
            // Handle new diaperType field and legacy type field
            const dType = d.diaperType || d.type;
            if (dType === 'pee' || dType === 'both') wetCount++;
            if (dType === 'poop' || dType === 'both') dirtyCount++;
        });

        return {
            totalSleepMs,
            feedingCount: feedingActs.length,
            diaperCount: diaperActs.length,
            wetCount,
            dirtyCount,
        };
    }, [activities, selectedDate]);

    const goToPreviousDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };

    const goToNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        // Don't allow future dates
        if (next <= new Date()) {
            setSelectedDate(next);
        }
    };

    const isToday = () => {
        const today = new Date();
        return selectedDate.toDateString() === today.toDateString();
    };

    const formatDate = (date: Date): string => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const handleDelete = (activity: Activity) => {
        Alert.alert(
            'Delete Activity',
            'Are you sure you want to delete this activity?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteActivity(activity.id),
                },
            ]
        );
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatSleepDuration = (ms: number): string => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getActivityDetails = (activity: Activity): string => {
        const type = getActivityType(activity);
        switch (type) {
            case 'sleep':
                const sleep = activity as SleepActivity;
                if (sleep.duration) {
                    return formatSleepDuration(sleep.duration);
                }
                return 'Duration not logged';
            case 'feeding':
                const feeding = activity as FeedingActivity;
                if (feeding.feedingType === 'breast') {
                    return `Breast${feeding.feedingSide ? ` (${feeding.feedingSide})` : ''}`;
                } else if (feeding.feedingType === 'bottle') {
                    return `Bottle${feeding.bottleAmount ? ` - ${feeding.bottleAmount}oz` : ''}`;
                } else {
                    return 'Solid food';
                }
            case 'diaper':
                const diaper = activity as any;
                const dType = diaper.diaperType || diaper.type;
                if (dType === 'both') return '💧💩 Wet + Dirty';
                return dType === 'pee' ? '💧 Wet' : '💩 Dirty';
            default:
                return '';
        }
    };

    const getIcon = (activity: Activity): string => {
        const type = getActivityType(activity);
        switch (type) {
            case 'sleep': return '😴';
            case 'feeding': return '🍼';
            case 'diaper': return '👶';
            default: return '📝';
        }
    };

    const filters: { key: FilterType; label: string; icon: string }[] = [
        { key: 'all', label: 'All', icon: '📋' },
        { key: 'sleep', label: 'Sleep', icon: '😴' },
        { key: 'feeding', label: 'Feed', icon: '🍼' },
        { key: 'diaper', label: 'Diaper', icon: '👶' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header with Date Navigation */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
                    <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    {!isToday() && (
                        <Text style={styles.fullDate}>
                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.navButton, isToday() && styles.navButtonDisabled]}
                    onPress={goToNextDay}
                    disabled={isToday()}
                >
                    <Text style={[styles.navButtonText, isToday() && styles.navButtonTextDisabled]}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Daily Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>😴</Text>
                    <Text style={styles.statValue}>{formatSleepDuration(dailyStats.totalSleepMs)}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🍼</Text>
                    <Text style={styles.statValue}>{dailyStats.feedingCount}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>👶</Text>
                    <Text style={styles.statValue}>{dailyStats.diaperCount}</Text>
                    <Text style={styles.statBreakdown}>💧{dailyStats.wetCount} 💩{dailyStats.dirtyCount}</Text>
                </View>
            </View>

            {/* Activity List */}
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {dayActivities.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyText}>No activities for this day</Text>
                    </View>
                ) : (
                    dayActivities.map((activity) => (
                        <TouchableOpacity
                            key={activity.id}
                            style={styles.activityItem}
                            onLongPress={() => handleDelete(activity)}
                        >
                            <View style={styles.activityIcon}>
                                <Text style={styles.activityIconText}>{getIcon(activity)}</Text>
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityType}>
                                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                </Text>
                                <Text style={styles.activityDetails}>{getActivityDetails(activity)}</Text>
                            </View>
                            <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Filter Bar at Bottom */}
            <View style={styles.filterBar}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={styles.filterIcon}>{f.icon}</Text>
                        <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navButtonText: {
        fontSize: 24,
        color: colors.primary,
        fontWeight: '600',
    },
    navButtonTextDisabled: {
        color: colors.textMuted,
    },
    dateContainer: {
        alignItems: 'center',
    },
    dateText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    fullDate: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    statBreakdown: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 2,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textMuted,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    activityIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityIconText: {
        fontSize: 20,
    },
    activityContent: {
        flex: 1,
    },
    activityType: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    activityDetails: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    activityTime: {
        fontSize: 13,
        color: colors.textMuted,
        fontWeight: '500',
    },
    filterBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: colors.card,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 8,
    },
    filterChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    filterChipActive: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}15`,
    },
    filterIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterLabelActive: {
        color: colors.primary,
    },
});
