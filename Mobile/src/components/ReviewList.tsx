// Componente ReviewList - Lista Paginada de Avaliações

import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Text,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import ReviewCard from './ReviewCard';
import EmptyState from './EmptyState';
import { reviewsAPI } from '../services/api';
import type { Review } from '../types';

interface ReviewListProps {
    productId: number;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadReviews = async (pageNum: number, isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await reviewsAPI.getProductReviews(productId, pageNum, 10);
            const data = response.data.data;

            if (isRefresh) {
                setReviews(data.content);
            } else {
                setReviews((prev) => [...prev, ...data.content]);
            }

            setHasMore(!data.last);
            setError(null);
        } catch (err: any) {
            console.error('Error loading reviews:', err);
            setError(err.response?.data?.message || 'Erro ao carregar avaliações');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadReviews(0);
    }, [productId]);

    const handleRefresh = () => {
        setPage(0);
        loadReviews(0, true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadReviews(nextPage);
        }
    };

    const renderFooter = () => {
        if (!loading || refreshing) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    if (error && reviews.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!loading && reviews.length === 0) {
        return (
            <EmptyState
                icon="💬"
                title="Nenhuma avaliação"
                message="Este produto ainda não possui avaliações. Seja o primeiro a avaliar!"
            />
        );
    }

    return (
        <FlatList
            data={reviews}
            renderItem={({ item }) => <ReviewCard review={item} />}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: spacing.md,
    },
    footer: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    errorContainer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    errorText: {
        fontSize: fontSize.md,
        color: colors.error,
        textAlign: 'center',
    },
});
