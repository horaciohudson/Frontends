// Tela de Detalhes do Pedido

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { salesAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import {
    formatCurrency,
    formatDateTime,
    translateOrderStatus,
    translatePaymentMethod,
    translateAddressType,
} from '../../utils/formatters';
import type { Sale, SaleStatus } from '../../types';

const STATUS_COLORS: Record<SaleStatus, string> = {
    PENDING: colors.warning,
    CONFIRMED: colors.info,
    PROCESSING: colors.primary,
    SHIPPED: colors.primaryLight,
    DELIVERED: colors.success,
    CANCELLED: colors.error,
};

export default function OrderDetailScreen({ route, navigation }: any) {
    const { orderId } = route.params;
    const [order, setOrder] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const response = await salesAPI.getSaleById(orderId);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Erro ao carregar pedido:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>❌</Text>
                <Text style={styles.errorText}>Pedido não encontrado</Text>
            </View>
        );
    }

    const statusColor = STATUS_COLORS[order.status] || colors.gray[500];

    return (
        <ScrollView style={styles.container}>
            {/* Header do Pedido */}
            <View style={styles.header}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>Pedido #{order.id}</Text>
                    <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>{translateOrderStatus(order.status)}</Text>
                </View>
            </View>

            {/* Timeline de Status (simplificado) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status do Pedido</Text>
                <View style={styles.timeline}>
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />
                        <Text style={styles.timelineText}>
                            {translateOrderStatus(order.status)} - {formatDateTime(order.updatedAt || order.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Itens do Pedido */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Itens do Pedido</Text>
                {order.items?.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemImage}>
                            {item.product.primaryImageUrl ? (
                                <Image source={{ uri: item.product.primaryImageUrl }} style={styles.productImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Text style={styles.placeholderText}>📦</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                            <Text style={styles.itemQuantity}>Qtd: {item.quantity}</Text>
                        </View>
                        <View style={styles.itemPrices}>
                            <Text style={styles.unitPrice}>{formatCurrency(item.price)}/un</Text>
                            <Text style={styles.subtotal}>{formatCurrency(item.subtotal)}</Text>

                            {/* Botão Avaliar - apenas para pedidos entregues */}
                            {order.status === 'DELIVERED' && (
                                <TouchableOpacity
                                    style={styles.reviewButton}
                                    onPress={() =>
                                        navigation.navigate('CreateReview', {
                                            productId: item.product.id,
                                            productName: item.product.name,
                                        })
                                    }
                                >
                                    <Text style={styles.reviewButtonText}>✍️ Avaliar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </View>

            {/* Endereço de Entrega */}
            {order.address && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressType}>
                            📍 {translateAddressType(order.address.addressType)}
                        </Text>
                        <Text style={styles.addressText}>
                            {order.address.street}, {order.address.number}
                            {order.address.complement ? ` - ${order.address.complement}` : ''}
                        </Text>
                        <Text style={styles.addressText}>
                            {order.address.neighborhood}
                        </Text>
                        <Text style={styles.addressText}>
                            {order.address.city} - {order.address.state}
                        </Text>
                        <Text style={styles.addressText}>
                            CEP: {order.address.zipCode}
                        </Text>
                    </View>
                </View>
            )}

            {/* Pagamento */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pagamento</Text>
                <View style={styles.paymentCard}>
                    <Text style={styles.paymentMethod}>
                        💳 {translatePaymentMethod(order.paymentMethod)}
                    </Text>
                </View>
            </View>

            {/* Resumo Financeiro */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo</Text>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
                    </View>
                    {order.discount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Desconto</Text>
                            <Text style={[styles.summaryValue, styles.discountValue]}>
                                -{formatCurrency(order.discount)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Frete</Text>
                        <Text style={styles.summaryValue}>
                            {order.shippingCost > 0 ? formatCurrency(order.shippingCost) : 'Grátis'}
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorIcon: {
        fontSize: 60,
        marginBottom: spacing.md,
    },
    errorText: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: colors.white,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    orderInfo: {},
    orderNumber: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    orderDate: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    statusText: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.white,
    },
    section: {
        backgroundColor: colors.white,
        marginBottom: spacing.sm,
        padding: spacing.md,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    timeline: {},
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    timelineText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    itemCard: {
        flexDirection: 'row',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemImage: {
        marginRight: spacing.md,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray[100],
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 24,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },
    itemQuantity: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    itemPrices: {
        alignItems: 'flex-end',
    },
    unitPrice: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },
    subtotal: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    reviewButton: {
        marginTop: spacing.sm,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    reviewButtonText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.white,
        textAlign: 'center',
    },
    addressCard: {
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    addressType: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    addressText: {
        fontSize: fontSize.sm,
        color: colors.text.primary,
        lineHeight: 20,
    },
    paymentCard: {
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    paymentMethod: {
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    summaryCard: {
        backgroundColor: colors.gray[50],
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    summaryValue: {
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },
    discountValue: {
        color: colors.success,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
        marginTop: spacing.sm,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.primary,
    },
});
