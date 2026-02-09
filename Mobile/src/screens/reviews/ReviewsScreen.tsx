// Tela de Avaliações do Produto - Lista Completa

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../theme';
import ReviewList from '../../components/ReviewList';

type ReviewsScreenRouteProp = RouteProp<{ Reviews: { productId: number; productName: string } }, 'Reviews'>;

export default function ReviewsScreen() {
    const route = useRoute<ReviewsScreenRouteProp>();
    const { productId } = route.params;

    return (
        <View style={styles.container}>
            <ReviewList productId={productId} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
