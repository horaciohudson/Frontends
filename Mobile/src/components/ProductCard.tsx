// Componente ProductCard Reutilizável

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import type { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    isFavorite?: boolean;
    onFavoriteToggle?: () => void;
}

export default function ProductCard({
    product,
    onPress,
    isFavorite,
    onFavoriteToggle
}: ProductCardProps) {
    const price = product.promotionalPrice || product.sellingPrice || product.price || 0;
    const hasDiscount = product.promotionalPrice && product.sellingPrice && product.promotionalPrice < product.sellingPrice;

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {/* Imagem */}
            <View style={styles.imageContainer}>
                {product.primaryImageUrl ? (
                    <Image
                        source={{ uri: product.primaryImageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.placeholderText}>📦</Text>
                    </View>
                )}

                {/* Botão de Favorito */}
                {onFavoriteToggle && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={onFavoriteToggle}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.favoriteIcon}>
                            {isFavorite ? '❤️' : '🤍'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Badge de desconto */}
                {hasDiscount && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {Math.round(((product.sellingPrice! - product.promotionalPrice!) / product.sellingPrice!) * 100)}% OFF
                        </Text>
                    </View>
                )}
            </View>

            {/* Informações */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                </Text>

                {/* Preços */}
                <View style={styles.priceContainer}>
                    {hasDiscount && (
                        <Text style={styles.oldPrice}>
                            {formatPrice(product.sellingPrice!)}
                        </Text>
                    )}
                    <Text style={styles.price}>{formatPrice(price)}</Text>
                </View>

                {/* Estoque */}
                {product.stockQuantity !== undefined && (
                    <Text style={styles.stock}>
                        {product.stockQuantity > 0
                            ? `${product.stockQuantity} em estoque`
                            : 'Fora de estoque'}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        backgroundColor: colors.gray[100],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray[200],
    },
    placeholderText: {
        fontSize: 60,
    },
    discountBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.error,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    favoriteButton: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    favoriteIcon: {
        fontSize: 20,
    },
    discountText: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: 'bold',
    },
    info: {
        padding: spacing.md,
    },
    name: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    oldPrice: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        textDecorationLine: 'line-through',
    },
    price: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.primary,
    },
    stock: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },
});
