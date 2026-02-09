// Tela de Sucesso no Checkout

import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

export default function CheckoutSuccessScreen({ route, navigation }: any) {
    const { orderId } = route.params || {};

    const handleGoHome = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const handleViewOrders = () => {
        navigation.navigate('Profile', {
            screen: 'Orders',
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>Pedido Realizado!</Text>
                <Text style={styles.subtitle}>
                    Seu pedido foi recebido com sucesso.
                </Text>

                {orderId && (
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderLabel}>Número do Pedido</Text>
                        <Text style={styles.orderId}>#{orderId}</Text>
                    </View>
                )}

                <Text style={styles.message}>
                    Você receberá atualizações sobre o status do seu pedido por email.
                </Text>

                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleViewOrders}>
                        <Text style={styles.primaryButtonText}>Ver Meus Pedidos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
                        <Text style={styles.secondaryButtonText}>Voltar ao Início</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    content: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        maxWidth: 400,
        width: '100%',
    },
    icon: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.success,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.lg,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    orderInfo: {
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginBottom: spacing.lg,
        width: '100%',
    },
    orderLabel: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    orderId: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    message: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    buttons: {
        width: '100%',
        gap: spacing.md,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.text.primary,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
