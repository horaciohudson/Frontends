// Tela CreateReviewScreen - Criar Avaliação de Produto

import React from 'react';
import {
    View,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../theme';
import ReviewForm from '../../components/ReviewForm';
import { reviewsAPI } from '../../services/api';
import type { ProductsStackParamList, CreateReviewData } from '../../types';

type CreateReviewScreenRouteProp = RouteProp<ProductsStackParamList, 'CreateReview'>;
type CreateReviewScreenNavigationProp = any;

export default function CreateReviewScreen() {
    const navigation = useNavigation<CreateReviewScreenNavigationProp>();
    const route = useRoute<CreateReviewScreenRouteProp>();
    const { productId, productName } = route.params;

    const handleSubmit = async (data: CreateReviewData) => {
        try {
            const reviewData = {
                productId: data.productId,
                reviewType: 'PRODUCT' as const,
                rating: data.rating,
                title: data.title,
                comment: data.comment,
                qualityRating: data.qualityRating,
                deliveryRating: data.deliveryRating,
                valueRating: data.valueRating,
            };

            await reviewsAPI.createReview(reviewData);

            Alert.alert(
                'Sucesso!',
                'Sua avaliação foi enviada com sucesso.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error creating review:', error);
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível enviar sua avaliação. Tente novamente.'
            );
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancelar Avaliação',
            'Tem certeza que deseja cancelar? Suas alterações serão perdidas.',
            [
                { text: 'Não', style: 'cancel' },
                { text: 'Sim', onPress: () => navigation.goBack() },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ReviewForm
                productId={productId}
                productName={productName}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
});
