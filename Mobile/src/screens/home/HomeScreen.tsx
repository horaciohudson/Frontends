// Tela Home - Produtos em destaque

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { productsAPI, categoriesAPI, wishlistAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProductCard } from '../../components';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters';
import type { Product, Category } from '../../types';

export default function HomeScreen({ navigation }: any) {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
    const { user } = useAuth();
    const { addItem } = useCart();

    useEffect(() => {
        loadData();
        if (user) {
            loadWishlist();
        }
    }, [user]);

    const loadWishlist = async () => {
        try {
            const response = await wishlistAPI.get();
            const ids = new Set((response.data.data || []).map(p => p.id));
            setWishlistIds(ids);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                productsAPI.getAll(0, 10),
                categoriesAPI.getAll(),
            ]);

            // Filtrar produtos em destaque ou pegar os primeiros
            const products = productsRes.data.data?.content || [];
            const featured = products.filter((p: Product) => p.featured);
            setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 6));

            setCategories(categoriesRes.data.data || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleProductPress = (product: Product) => {
        navigation.navigate('ProductDetail', { productId: product.id });
    };

    const handleCategoryPress = (category: Category) => {
        navigation.navigate('Products', { screen: 'ProductsScreen', params: { categoryId: category.id } });
    };

    const handleToggleFavorite = async (productId: number) => {
        if (!user) {
            Alert.alert('Login Necessário', 'Faça login para favoritar produtos.');
            return;
        }

        try {
            const response = await wishlistAPI.toggle(productId);
            const isAdded = response.data.data;

            setWishlistIds(prev => {
                const next = new Set(prev);
                if (isAdded) next.add(productId);
                else next.delete(productId);
                return next;
            });
        } catch (error) {
            console.error('Erro ao favoritar:', error);
        }
    };

    const renderProductCard = ({ item }: { item: Product }) => (
        <View style={styles.productCardContainer}>
            <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
                isFavorite={wishlistIds.has(item.id)}
                onFavoriteToggle={() => handleToggleFavorite(item.id)}
            />
        </View>
    );

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item)}
        >
            <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>🏷️</Text>
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Bem-vindo ao SigeveClaud!</Text>
                <Text style={styles.bannerSubtitle}>Encontre as melhores ofertas</Text>
            </View>

            {/* Categorias */}
            {categories.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categorias</Text>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>
            )}

            {/* Produtos em destaque */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Produtos em Destaque</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                        <Text style={styles.seeAllText}>Ver todos</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={featuredProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productsList}
                />
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
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.text.secondary,
        fontSize: fontSize.md,
    },
    banner: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    bannerTitle: {
        color: colors.white,
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
    },
    bannerSubtitle: {
        color: colors.white,
        fontSize: fontSize.md,
        opacity: 0.9,
        marginTop: spacing.xs,
    },
    section: {
        padding: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    seeAllText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontWeight: '600',
    },
    categoriesList: {
        paddingRight: spacing.md,
    },
    categoryItem: {
        alignItems: 'center',
        marginRight: spacing.md,
        width: 80,
    },
    categoryIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    categoryEmoji: {
        fontSize: 28,
    },
    categoryName: {
        fontSize: fontSize.xs,
        color: colors.text.primary,
        textAlign: 'center',
    },
    productsList: {
        paddingRight: spacing.md,
    },
    productCardContainer: {
        width: 160,
        marginRight: spacing.md,
    },
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        backgroundColor: colors.gray[100],
    },
    placeholderImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 40,
    },
    discountBadge: {
        position: 'absolute',
        top: spacing.xs,
        left: spacing.xs,
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    discountText: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: 'bold',
    },
    productInfo: {
        padding: spacing.sm,
    },
    productName: {
        fontSize: fontSize.sm,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        height: 36,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    price: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.primary,
    },
    originalPrice: {
        fontSize: fontSize.sm,
        color: colors.gray[400],
        textDecorationLine: 'line-through',
    },
    discountPrice: {
        fontSize: fontSize.md,
        fontWeight: 'bold',
        color: colors.accent,
    },
});
