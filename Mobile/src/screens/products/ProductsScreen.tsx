// Tela de Listagem de Produtos

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Image,
    TextInput,
    Alert,
} from 'react-native';
import { productsAPI, wishlistAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters';
import { ProductCard, SkeletonLoader, FadeInView } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import type { Product } from '../../types';

export default function ProductsScreen({ navigation, route }: any) {
    const categoryId = route?.params?.categoryId;
    const initialSearch = route?.params?.search || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
    const { user } = useAuth();

    useEffect(() => {
        loadProducts(true);
        if (user) {
            loadWishlist();
        }
    }, [categoryId, user]);

    const loadWishlist = async () => {
        try {
            const response = await wishlistAPI.get();
            const ids = new Set((response.data.data || []).map(p => p.id));
            setWishlistIds(ids);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        }
    };

    const loadProducts = async (reset: boolean = false) => {
        if (loading && !reset) return;

        try {
            if (reset) {
                setLoading(true);
                setPage(0);
            } else {
                setLoadingMore(true);
            }

            const currentPage = reset ? 0 : page;
            let response;

            if (search.trim()) {
                response = await productsAPI.search(search.trim(), currentPage, 20);
            } else if (categoryId) {
                response = await productsAPI.getByCategory(categoryId, currentPage, 20);
            } else {
                response = await productsAPI.getAll(currentPage, 20);
            }

            const data = response.data.data;
            const newProducts = data?.content || [];

            if (reset) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }

            setHasMore(!data?.last);
            setPage(currentPage + 1);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts(true);
        setRefreshing(false);
    };

    const onEndReached = () => {
        if (!loadingMore && hasMore) {
            loadProducts(false);
        }
    };

    const handleSearch = () => {
        loadProducts(true);
    };

    const handleProductPress = (product: Product) => {
        navigation.navigate('ProductDetail', { productId: product.id });
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

    const renderProduct = ({ item, index }: { item: Product; index: number }) => (
        <View style={styles.productCardContainer}>
            <FadeInView delay={index * 50} duration={300}>
                <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                    isFavorite={wishlistIds.has(item.id)}
                    onFavoriteToggle={() => handleToggleFavorite(item.id)}
                />
            </FadeInView>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
                <Text style={styles.emptyText}>Tente buscar por outro termo</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Barra de Busca */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar produtos..."
                    placeholderTextColor={colors.gray[400]}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text>🔍</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchInput: {
        flex: 1,
        backgroundColor: colors.gray[50],
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    searchButton: {
        marginLeft: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.sm,
    },
    row: {
        justifyContent: 'space-between',
    },
    productCardContainer: {
        width: '48%',
    },
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        backgroundColor: colors.gray[100],
    },
    placeholderImage: {
        width: '100%',
        height: 140,
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
    productBrand: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
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
    footerLoader: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
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
    },
});
