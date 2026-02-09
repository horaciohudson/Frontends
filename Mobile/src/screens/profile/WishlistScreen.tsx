// Tela de Favoritos (Wishlist)

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { wishlistAPI } from '../../services/api';
import { colors, spacing, fontSize } from '../../theme';
import { ProductCard, EmptyState, ProductCardSkeleton } from '../../components';
import type { Product } from '../../types';

export default function WishlistScreen({ navigation }: any) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadWishlist = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await wishlistAPI.get();
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            Alert.alert('Erro', 'Não foi possível carregar seus favoritos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadWishlist();
        });
        return unsubscribe;
    }, [navigation, loadWishlist]);

    const onRefresh = () => {
        setRefreshing(true);
        loadWishlist(false);
    };

    const handleProductPress = (product: Product) => {
        navigation.navigate('ProductDetail', { productId: product.id });
    };

    const handleToggleFavorite = async (productId: number) => {
        try {
            const response = await wishlistAPI.toggle(productId);
            const isAdded = response.data.data;

            // Se foi removido (false), tirar da lista local
            if (!isAdded) {
                setProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (error) {
            console.error('Erro ao alternar favorito:', error);
            Alert.alert('Erro', 'Não foi possível atualizar favoritos.');
        }
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.cardContainer}>
            <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
                isFavorite={true} // Sempre true nesta tela
                onFavoriteToggle={() => handleToggleFavorite(item.id)}
            />
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.row}>
                    <View style={styles.cardContainer}><ProductCardSkeleton /></View>
                    <View style={styles.cardContainer}><ProductCardSkeleton /></View>
                </View>
                <View style={styles.row}>
                    <View style={styles.cardContainer}><ProductCardSkeleton /></View>
                    <View style={styles.cardContainer}><ProductCardSkeleton /></View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="❤️"
                        title="Sua lista está vazia"
                        message="Salve seus produtos favoritos para encontrá-los facilmente depois."
                        actionLabel="Explorar Produtos"
                        onAction={() => navigation.navigate('Products')}
                    />
                }
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
        padding: spacing.md,
    },
    listContent: {
        padding: spacing.md,
        flexGrow: 1,
    },
    row: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%',
    },
});
