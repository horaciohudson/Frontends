// Componente ReviewCard - Exibir Avaliação Individual

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import RatingStars from './RatingStars';
import type { Review } from '../types';

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>
                            {review.reviewerName || 'Usuário'}
                        </Text>
                        <Text style={styles.date}>
                            {formatDate(review.createdAt)}
                        </Text>
                    </View>
                </View>
                {review.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verificado</Text>
                    </View>
                )}
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
                <RatingStars rating={review.rating} size={18} />
            </View>

            {/* Title */}
            {review.title && (
                <Text style={styles.title}>{review.title}</Text>
            )}

            {/* Comment */}
            {review.comment && (
                <Text style={styles.comment}>{review.comment}</Text>
            )}

            {/* Detailed Ratings */}
            {(review.qualityRating || review.deliveryRating || review.valueRating) && (
                <View style={styles.detailedRatings}>
                    {review.qualityRating && (
                        <View style={styles.detailedRating}>
                            <Text style={styles.detailedLabel}>Qualidade:</Text>
                            <RatingStars rating={review.qualityRating} size={14} />
                        </View>
                    )}
                    {review.deliveryRating && (
                        <View style={styles.detailedRating}>
                            <Text style={styles.detailedLabel}>Entrega:</Text>
                            <RatingStars rating={review.deliveryRating} size={14} />
                        </View>
                    )}
                    {review.valueRating && (
                        <View style={styles.detailedRating}>
                            <Text style={styles.detailedLabel}>Custo-benefício:</Text>
                            <RatingStars rating={review.valueRating} size={14} />
                        </View>
                    )}
                </View>
            )}

            {/* Response */}
            {review.response && (
                <View style={styles.responseContainer}>
                    <Text style={styles.responseLabel}>Resposta do vendedor:</Text>
                    <Text style={styles.responseText}>{review.response}</Text>
                    {review.responseDate && (
                        <Text style={styles.responseDate}>
                            {formatDate(review.responseDate)}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
    },
    date: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
    },
    verifiedBadge: {
        backgroundColor: colors.success + '20',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    verifiedText: {
        fontSize: fontSize.xs,
        color: colors.success,
        fontWeight: '600',
    },
    ratingContainer: {
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    comment: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    detailedRatings: {
        gap: spacing.xs,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
    },
    detailedRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    detailedLabel: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        width: 100,
    },
    responseContainer: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        backgroundColor: colors.gray[50],
        borderRadius: borderRadius.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    responseLabel: {
        fontSize: fontSize.xs,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    responseText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 18,
    },
    responseDate: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
});
