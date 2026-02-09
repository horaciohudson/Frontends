// Componente AppliedCouponBadge - Badge de Cupom Aplicado

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface AppliedCouponBadgeProps {
    couponCode: string;
    discountAmount: number;
    onRemove: () => void;
}

export default function AppliedCouponBadge({
    couponCode,
    discountAmount,
    onRemove,
}: AppliedCouponBadgeProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🎟️</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.code}>{couponCode}</Text>
                    <Text style={styles.discount}>
                        Desconto: {formatCurrency(discountAmount)}
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.success + '15',
        borderWidth: 1,
        borderColor: colors.success,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    icon: {
        fontSize: 24,
    },
    info: {
        flex: 1,
    },
    code: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.success,
        marginBottom: spacing.xs,
    },
    discount: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.error + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    removeText: {
        fontSize: fontSize.lg,
        color: colors.error,
        fontWeight: 'bold',
    },
});
