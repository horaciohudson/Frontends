// Tela de Histórico de Pedidos

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { salesAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import { formatCurrency, formatDate, translateOrderStatus } from '../../utils/formatters';
import type { Sale, SaleStatus } from '../../types';

const STATUS_COLORS: Record<SaleStatus, string> = {
    PENDING: colors.warning,
    CONFIRMED: colors.info,
    PROCESSING: colors.primary,
    SHIPPED: colors.primaryLight,
    DELIVERED: colors.success,
    CANCELLED: colors.error,
};

export default function OrdersScreen({ navigation }: any) {
    const [orders, setOrders] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadOrders(true);
    }, []);

    const loadOrders = async (reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setPage(0);
            } else {
                setLoadingMore(true);
            }

            const currentPage = reset ? 0 : page;
            const response = await salesAPI.getMySales(currentPage, 20);
            const data = response.data.data;
            const newOrders = data?.content || [];

            if (reset) {
                setOrders(newOrders);
            } else {
                setOrders(prev => [...prev, ...newOrders]);
            }

            setHasMore(!data?.last);
            setPage(currentPage + 1);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders(true);
        setRefreshing(false);
    };

    const onEndReached = () => {
        if (!loadingMore && hasMore) {
            loadOrders(false);
        }
    };

    const handleOrderPress = (order: Sale) => {
        navigation.navigate('OrderDetail', { orderId: order.id });
    };

    const renderOrder = ({ item }: { item: Sale }) => {
        const statusColor = STATUS_COLORS[item.status] || colors.gray[500];
        const itemCount = item.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => handleOrderPress(item)}
            >
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{translateOrderStatus(item.status)}</Text>
                    </View>
                </View>

                <View style={styles.orderInfo}>
                    <Text style={styles.itemsCount}>
                        {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                    </Text>
                    <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
                </View>

                {item.deliveryAddress && (
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressLabel}>📍 Entrega:</Text>
                        <Text style={styles.addressText} numberOfLines={1}>
                            {item.deliveryAddress.street}, {item.deliveryAddress.number} - {item.deliveryAddress.city}/{item.deliveryAddress.state}
                        </Text>
                    </View>
                )}

                <View style={styles.orderFooter}>
                    <Text style={styles.viewDetails}>Ver detalhes →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
                <Text style={styles.emptyText}>Você ainda não fez nenhum pedido</Text>
                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => navigation.navigate('Products')}
                >
                    <Text style={styles.browseButtonText}>Começar a Comprar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
            />
        </View>
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
    listContent: {
        padding: spacing.md,
        flexGrow: 1,
    },
    orderCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    orderNumber: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    orderDate: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.white,
    },
    orderInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    itemsCount: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    orderTotal: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.primary,
    },
    orderFooter: {
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    viewDetails: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    addressContainer: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    addressLabel: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    addressText: {
        fontSize: fontSize.sm,
        color: colors.text.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    browseButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    browseButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    footerLoader: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
});
