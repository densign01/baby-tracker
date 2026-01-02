// ===== Premium Upgrade Modal =====

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { colors, radius, spacing } from '../../src/theme/simple';
import { useSubscriptionStore, PREMIUM_FEATURES, PremiumFeature } from '../../src/store/subscriptionStore';

interface PremiumUpgradeModalProps {
    visible: boolean;
    onClose: () => void;
    highlightFeature?: PremiumFeature;
}

export default function PremiumUpgradeModal({
    visible,
    onClose,
    highlightFeature,
}: PremiumUpgradeModalProps) {
    const { upgradeToPremium } = useSubscriptionStore();

    const handleSubscribe = (plan: 'monthly' | 'yearly') => {
        // TODO: Implement actual IAP here
        // For now, just upgrade (for testing)
        console.log(`Subscribe to ${plan} plan`);

        // Simulated upgrade for testing
        // Remove this when implementing real IAP
        // upgradeToPremium();
        // onClose();

        // Show coming soon message
        alert('Premium features will be available in a future update.');
    };

    const handleRestore = async () => {
        // TODO: Implement restore purchases
        alert('Restore purchases will be available when IAP is implemented.');
    };

    const features: { key: PremiumFeature; icon: string }[] = [
        { key: 'share_partner', icon: '👨‍👩‍👧' },
        { key: 'multiple_babies', icon: '👶' },
        { key: 'export_data', icon: '📊' },
        { key: 'priority_support', icon: '⭐' },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerIcon}>😴</Text>
                            <Text style={styles.headerTitle}>Swaddle Premium</Text>
                            <Text style={styles.headerSubtitle}>
                                Unlock all features for the complete experience
                            </Text>
                        </View>

                        {/* Features */}
                        <View style={styles.featuresSection}>
                            {features.map(({ key, icon }) => (
                                <View
                                    key={key}
                                    style={[
                                        styles.featureRow,
                                        highlightFeature === key && styles.featureHighlight,
                                    ]}
                                >
                                    <Text style={styles.featureIcon}>{icon}</Text>
                                    <View style={styles.featureText}>
                                        <Text style={styles.featureName}>
                                            {PREMIUM_FEATURES[key].name}
                                        </Text>
                                        <Text style={styles.featureDescription}>
                                            {PREMIUM_FEATURES[key].description}
                                        </Text>
                                    </View>
                                    <Text style={styles.checkmark}>✓</Text>
                                </View>
                            ))}
                        </View>

                        {/* Pricing */}
                        <View style={styles.pricingSection}>
                            <TouchableOpacity
                                style={styles.pricingCard}
                                onPress={() => handleSubscribe('yearly')}
                            >
                                <View style={styles.saveBadge}>
                                    <Text style={styles.saveBadgeText}>SAVE 17%</Text>
                                </View>
                                <Text style={styles.pricingPeriod}>Yearly</Text>
                                <Text style={styles.pricingPrice}>$29.99</Text>
                                <Text style={styles.pricingNote}>per year</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.pricingCard, styles.pricingCardSecondary]}
                                onPress={() => handleSubscribe('monthly')}
                            >
                                <Text style={styles.pricingPeriod}>Monthly</Text>
                                <Text style={styles.pricingPrice}>$2.99</Text>
                                <Text style={styles.pricingNote}>per month</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Restore */}
                        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
                            <Text style={styles.restoreText}>Restore Purchases</Text>
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text style={styles.terms}>
                            Subscription automatically renews unless cancelled at least 24 hours before
                            the end of the current period. Manage subscriptions in your App Store settings.
                        </Text>
                    </ScrollView>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        maxHeight: '90%',
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.xxl,
        paddingHorizontal: spacing.xxl,
    },
    headerIcon: {
        fontSize: 56,
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    featuresSection: {
        padding: spacing.xxl,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    featureHighlight: {
        backgroundColor: colors.primaryLight + '30',
        marginHorizontal: -spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
    },
    featureIcon: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    featureDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    checkmark: {
        fontSize: 18,
        color: colors.accent,
        fontWeight: '700',
    },
    pricingSection: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xxl,
        gap: spacing.md,
    },
    pricingCard: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    pricingCardSecondary: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.border,
    },
    saveBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.sm,
    },
    saveBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: '700',
    },
    pricingPeriod: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.white,
        marginBottom: spacing.xs,
    },
    pricingPrice: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.white,
    },
    pricingNote: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    restoreButton: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    restoreText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    terms: {
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'center',
        paddingHorizontal: spacing.xxl,
        marginBottom: spacing.lg,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    closeText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
