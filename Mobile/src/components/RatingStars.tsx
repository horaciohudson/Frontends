// Componente RatingStars - Exibição e Input de Avaliações

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: number;
    readonly?: boolean;
    onRatingChange?: (rating: number) => void;
    showNumber?: boolean;
}

export default function RatingStars({
    rating,
    maxRating = 5,
    size = 20,
    readonly = true,
    onRatingChange,
    showNumber = false,
}: RatingStarsProps) {
    const handlePress = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const renderStar = (index: number) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isHalf = !isFilled && starValue <= Math.ceil(rating);

        let starIcon = '☆'; // Empty star
        if (isFilled) {
            starIcon = '⭐'; // Filled star
        } else if (isHalf) {
            starIcon = '⭐'; // Half star (simplified, could use custom icon)
        }

        const StarComponent = readonly ? View : TouchableOpacity;

        return (
            <StarComponent
                key={index}
                onPress={() => !readonly && handlePress(starValue)}
                activeOpacity={0.7}
                style={styles.starContainer}
            >
                <Text style={[styles.star, { fontSize: size }]}>
                    {starIcon}
                </Text>
            </StarComponent>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.starsContainer}>
                {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
            </View>
            {showNumber && (
                <Text style={styles.ratingNumber}>
                    {rating.toFixed(1)}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    starContainer: {
        padding: 2,
    },
    star: {
        color: colors.warning,
    },
    ratingNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
        marginLeft: spacing.xs,
    },
});
