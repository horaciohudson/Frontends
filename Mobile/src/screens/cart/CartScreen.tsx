// Tela do Carrinho

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import { formatCurrency } from '../../utils/formatters';
import type { CartItem } from '../../types';

export default function CartScreen({ navigation }: any) {
    const { items, total, loading, updateQuantity, removeItem, clearCart } = useCart();

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        try {
            await updateQuantity(itemId, newQuantity);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a quantidade.');
        }
    };

    const handleRemoveItem = (itemId: number, productName: string) => {
        Alert.alert(
            'Remover Item',
            `Deseja remover "${productName}" do carrinho?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeItem(itemId);
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível remover o item.');
                        }
                    }
                },
            ]
        );
    };

    const handleClearCart = () => {
        Alert.alert(
            'Limpar Carrinho',
            'Deseja remover todos os itens do carrinho?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearCart();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível limpar o carrinho.');
                        }
                    }
                },
            ]
        );
    };

    const handleCheckout = () => {
        navigation.navigate('Checkout');
    };

    const renderItem = ({ item }: { item: CartItem }) => {
        // Proteção contra dados incompletos da API
        if (!item.product) {
            console.error('⚠️ Item sem produto:', item);
            return null;
        }

        const price = item.product.promotionalPrice || item.product.sellingPrice || item.product.currentPrice || 0;

        return (
            <View style={styles.cartItem}>
                {/* Imagem */}
                <View style={styles.imageContainer}>
                    {item.product.primaryImageUrl ? (
                        <Image source={{ uri: item.product.primaryImageUrl }} style={styles.itemImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>📦</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(price)}</Text>

                    {/* Controles de Quantidade */}
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading}
                        >
                            <Text style={styles.quantityButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Subtotal e Remover */}
                <View style={styles.itemActions}>
                    <Text style={styles.subtotal}>{formatCurrency(item.subtotal)}</Text>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.id, item.product.name)}
                    >
                        <Text style={styles.removeText}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
            <Text style={styles.emptyText}>Adicione produtos para continuar</Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Products')}
            >
                <Text style={styles.browseButtonText}>Ver Produtos</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && items.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {items.length > 0 ? (
                <>
                    {/* Header do Carrinho */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{items.length} {items.length === 1 ? 'item' : 'itens'}</Text>
                        <TouchableOpacity onPress={handleClearCart}>
                            <Text style={styles.clearText}>Limpar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lista de Itens */}
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Footer com Total e Checkout */}
                    <View style={styles.footer}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                renderEmpty()
            )}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    clearText: {
        fontSize: fontSize.sm,
        color: colors.accent,
    },
    listContent: {
        padding: spacing.md,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    imageContainer: {
        marginRight: spacing.md,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray[100],
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 30,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: fontSize.sm,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    itemPrice: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 28,
        height: 28,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: fontSize.lg,
        color: colors.text.primary,
        fontWeight: 'bold',
    },
    quantity: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginHorizontal: spacing.md,
        minWidth: 24,
        textAlign: 'center',
    },
    itemActions: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    subtotal: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    removeButton: {
        padding: spacing.xs,
    },
    removeText: {
        fontSize: 20,
    },
    footer: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.lg,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    totalLabel: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
    },
    totalValue: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
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
});
