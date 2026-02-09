// Componente ReviewSummary - Resumo de Avaliações do Produto

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import RatingStars from './RatingStars';

interface ReviewSummaryProps {
    averageRating: number;
    totalRatings: number;
    ratingDistribution?: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

export default function ReviewSummary({
    averageRating,
    totalRatings,
    ratingDistribution,
}: ReviewSummaryProps) {
    const renderRatingBar = (stars: number, count: number) => {
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

        return (
            <View key={stars} style={styles.ratingBarContainer}>
                <Text style={styles.starLabel}>{stars}★</Text>
                <View style={styles.barBackground}>
                    <View
                        style={[
                            styles.barFill,
                            { width: `${percentage}%` },
                        ]}
                    />
                </View>
                <Text style={styles.countLabel}>{count}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Overall Rating */}
            <View style={styles.overallContainer}>
                <Text style={styles.averageNumber}>
                    {averageRating.toFixed(1)}
                </Text>
                <RatingStars rating={averageRating} size={24} showNumber={false} />
                <Text style={styles.totalRatings}>
                    {totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'}
                </Text>
            </View>

            {/* Rating Distribution */}
            {ratingDistribution && (
                <View style={styles.distributionContainer}>
                    {[5, 4, 3, 2, 1].map((stars) =>
                        renderRatingBar(stars, ratingDistribution[stars as keyof typeof ratingDistribution] || 0)
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    overallContainer: {
        alignItems: 'center',
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    averageNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    totalRatings: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    distributionContainer: {
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    ratingBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    starLabel: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        width: 30,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: colors.gray[200],
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: colors.warning,
        borderRadius: borderRadius.sm,
    },
    countLabel: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        width: 30,
        textAlign: 'right',
    },
});
