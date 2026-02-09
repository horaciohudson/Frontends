// Tela de Detalhes do Produto

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native';
import { productsAPI, wishlistAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters';
import { shareProduct } from '../../utils/shareUtils';
import ReviewSummary from '../../components/ReviewSummary';
import ReviewList from '../../components/ReviewList';
import type { Product } from '../../types';

export default function ProductDetailScreen({ route, navigation }: any) {
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useAuth();

    const { addItem } = useCart();
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getById(productId);
            setProduct(response.data.data);

            // Verificar se está nos favoritos
            if (user) {
                const wishResponse = await wishlistAPI.check(productId);
                setIsFavorite(wishResponse.data.data);
            }
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            Alert.alert('Erro', 'Não foi possível carregar o produto.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            setAddingToCart(true);
            console.log('🛒 Tentando adicionar produto:', product.id);

            await addItem(product.id, quantity);

            console.log('✅ Produto adicionado com sucesso');
            showSuccess('Produto adicionado ao carrinho!');
        } catch (error) {
            console.error('❌ Erro ao adicionar ao carrinho:', error);
            showError('Erro ao adicionar ao carrinho.');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigation.navigate('Cart');
    };

    const incrementQuantity = () => {
        const stock = product?.stockQuantity || 0;
        if (product && quantity < stock) {
            setQuantity(q => q + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            Alert.alert('Login Necessário', 'Faça login para favoritar produtos.');
            return;
        }

        try {
            const response = await wishlistAPI.toggle(productId);
            setIsFavorite(response.data.data);
            showSuccess(response.data.data ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
            showError('Erro ao atualizar favoritos.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Produto não encontrado</Text>
            </View>
        );
    }

    const price = product.sellingPrice || product.currentPrice || 0;
    const discountPrice = product.promotionalPrice;
    const hasDiscount = discountPrice && discountPrice < price;
    const discountPercent = hasDiscount
        ? calculateDiscountPercentage(price, discountPrice!)
        : 0;
    const finalPrice = hasDiscount ? discountPrice! : price;
    const stock = product.stockQuantity || 0;
    const isOutOfStock = stock <= 0 || product.status === 'OUT_OF_STOCK';

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Imagem do Produto */}
                <View style={styles.imageContainer}>
                    {product.primaryImageUrl ? (
                        <Image
                            source={{ uri: product.primaryImageUrl }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>📦</Text>
                        </View>
                    )}

                    {/* Botão de Voltar */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>

                    {/* Botão de Favorito */}
                    <TouchableOpacity
                        style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
                        onPress={handleToggleFavorite}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.favoriteIcon}>
                            {isFavorite ? '❤️' : '🤍'}
                        </Text>
                    </TouchableOpacity>

                    {/* Botão de Compartilhar */}
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => shareProduct(product)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.shareIcon}>📤</Text>
                    </TouchableOpacity>

                    {/* Badge de Desconto */}
                    {hasDiscount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                -{discountPercent}% OFF
                            </Text>
                        </View>
                    )}
                </View>

                {/* Informações do Produto */}
                <View style={styles.infoContainer}>
                    {product.brand && (
                        <Text style={styles.brand}>{product.brand}</Text>
                    )}
                    <Text style={styles.name}>{product.name}</Text>

                    {/* Preço */}
                    <View style={styles.priceContainer}>
                        {hasDiscount ? (
                            <>
                                <Text style={styles.originalPrice}>{formatCurrency(price)}</Text>
                                <Text style={styles.discountPrice}>{formatCurrency(discountPrice!)}</Text>
                            </>
                        ) : (
                            <Text style={styles.price}>{formatCurrency(price)}</Text>
                        )}
                    </View>

                    {/* Disponibilidade */}
                    <View style={styles.stockContainer}>
                        {isOutOfStock ? (
                            <Text style={styles.outOfStock}>❌ Produto Indisponível</Text>
                        ) : (
                            <Text style={styles.inStock}>✅ Em estoque ({stock} disponíveis)</Text>
                        )}
                    </View>

                    {/* Detalhes */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.sectionTitle}>Descrição</Text>
                        <Text style={styles.description}>{product.description || 'Sem descrição disponível.'}</Text>
                    </View>

                    {/* Características */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.sectionTitle}>Características</Text>
                        <View style={styles.attributesList}>
                            {product.color && (
                                <View style={styles.attribute}>
                                    <Text style={styles.attributeLabel}>Cor:</Text>
                                    <Text style={styles.attributeValue}>{product.color}</Text>
                                </View>
                            )}
                            {product.size && (
                                <View style={styles.attribute}>
                                    <Text style={styles.attributeLabel}>Tamanho:</Text>
                                    <Text style={styles.attributeValue}>{product.size}</Text>
                                </View>
                            )}
                            {product.productCondition && (
                                <View style={styles.attribute}>
                                    <Text style={styles.attributeLabel}>Condição:</Text>
                                    <Text style={styles.attributeValue}>
                                        {product.productCondition === 'NEW' ? 'Novo' :
                                            product.productCondition === 'USED' ? 'Usado' : 'Recondicionado'}
                                    </Text>
                                </View>
                            )}
                            {product.sku && (
                                <View style={styles.attribute}>
                                    <Text style={styles.attributeLabel}>SKU:</Text>
                                    <Text style={styles.attributeValue}>{product.sku}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Avaliações */}
                    <View style={styles.reviewsContainer}>
                        <View style={styles.reviewsHeader}>
                            <Text style={styles.sectionTitle}>Avaliações</Text>
                            {user && (
                                <TouchableOpacity
                                    style={styles.writeReviewButton}
                                    onPress={() =>
                                        navigation.navigate('CreateReview', {
                                            productId: product.id,
                                            productName: product.name,
                                        })
                                    }
                                >
                                    <Text style={styles.writeReviewText}>✍️ Avaliar</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {product.totalRatings && product.totalRatings > 0 ? (
                            <>
                                <ReviewSummary
                                    averageRating={product.averageRating || 0}
                                    totalRatings={product.totalRatings}
                                />
                                <TouchableOpacity
                                    style={styles.viewAllReviewsButton}
                                    onPress={() =>
                                        navigation.navigate('Reviews', {
                                            productId: product.id,
                                            productName: product.name,
                                        })
                                    }
                                >
                                    <Text style={styles.viewAllReviewsText}>
                                        Ver todas as avaliações →
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.noReviews}>
                                <Text style={styles.noReviewsText}>
                                    📝 Nenhuma avaliação ainda
                                </Text>
                                <Text style={styles.noReviewsSubtext}>
                                    Seja o primeiro a avaliar este produto!
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer com ações */}
            {!isOutOfStock && (
                <View style={styles.footer}>
                    {/* Seletor de Quantidade */}
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={decrementQuantity}
                            disabled={quantity <= 1}
                        >
                            <Text style={styles.quantityButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={incrementQuantity}
                            disabled={quantity >= stock}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botões de Ação */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.cartButton, addingToCart && styles.buttonDisabled]}
                            onPress={handleAddToCart}
                            disabled={addingToCart}
                        >
                            {addingToCart ? (
                                <ActivityIndicator color={colors.primary} size="small" />
                            ) : (
                                <Text style={styles.cartButtonText}>🛒 Carrinho</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.buyButton, addingToCart && styles.buttonDisabled]}
                            onPress={handleBuyNow}
                            disabled={addingToCart}
                        >
                            <Text style={styles.buyButtonText}>Comprar Agora</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
    },
    imageContainer: {
        position: 'relative',
        backgroundColor: colors.white,
    },
    productImage: {
        width: '100%',
        height: 300,
        backgroundColor: colors.gray[100],
    },
    placeholderImage: {
        width: '100%',
        height: 300,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 80,
    },
    favoriteButton: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.white,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    favoriteActive: {
        backgroundColor: colors.white,
    },
    favoriteIcon: {
        fontSize: 24,
    },
    shareButton: {
        position: 'absolute',
        top: spacing.lg + 50, // Below favorite button
        right: spacing.lg,
        backgroundColor: colors.white,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    shareIcon: {
        fontSize: 20,
    },
    discountBadge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
    },
    discountText: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: spacing.lg,
        left: spacing.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    backButtonText: {
        fontSize: 24,
        color: colors.text.primary,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: spacing.lg,
        backgroundColor: colors.white,
        marginTop: spacing.sm,
    },
    brand: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    price: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    originalPrice: {
        fontSize: fontSize.lg,
        color: colors.gray[400],
        textDecorationLine: 'line-through',
    },
    discountPrice: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.accent,
    },
    stockContainer: {
        marginBottom: spacing.md,
    },
    inStock: {
        fontSize: fontSize.sm,
        color: colors.success,
    },
    outOfStock: {
        fontSize: fontSize.sm,
        color: colors.error,
    },
    detailsContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        lineHeight: 24,
    },
    attributesList: {
        gap: spacing.sm,
    },
    attribute: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    attributeLabel: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    attributeValue: {
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    footer: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.lg,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    quantityButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: fontSize.xl,
        color: colors.text.primary,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginHorizontal: spacing.lg,
        minWidth: 40,
        textAlign: 'center',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    cartButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    cartButtonText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    buyButton: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    buyButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    reviewsContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    writeReviewButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    writeReviewText: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    viewAllReviewsButton: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.gray[100],
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    viewAllReviewsText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.primary,
    },
    noReviews: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    noReviewsText: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    noReviewsSubtext: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
});
