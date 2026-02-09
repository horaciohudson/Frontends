// Componente ReviewForm - Formulário para Criar Avaliação

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';
import RatingStars from './RatingStars';
import type { CreateReviewData } from '../types';

interface ReviewFormProps {
    productId: number;
    productName: string;
    onSubmit: (data: CreateReviewData) => Promise<void>;
    onCancel: () => void;
}

export default function ReviewForm({
    productId,
    productName,
    onSubmit,
    onCancel,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [qualityRating, setQualityRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [valueRating, setValueRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validação
        if (rating === 0) {
            Alert.alert('Erro', 'Por favor, selecione uma avaliação');
            return;
        }

        if (!title.trim()) {
            Alert.alert('Erro', 'Por favor, adicione um título');
            return;
        }

        if (!comment.trim()) {
            Alert.alert('Erro', 'Por favor, adicione um comentário');
            return;
        }

        try {
            setSubmitting(true);
            await onSubmit({
                productId,
                rating,
                title: title.trim(),
                comment: comment.trim(),
                qualityRating: qualityRating > 0 ? qualityRating : undefined,
                deliveryRating: deliveryRating > 0 ? deliveryRating : undefined,
                valueRating: valueRating > 0 ? valueRating : undefined,
            });
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Product Name */}
            <Text style={styles.productName}>{productName}</Text>

            {/* Overall Rating */}
            <View style={styles.section}>
                <Text style={styles.label}>
                    Avaliação Geral <Text style={styles.required}>*</Text>
                </Text>
                <RatingStars
                    rating={rating}
                    readonly={false}
                    size={32}
                    onRatingChange={setRating}
                />
            </View>

            {/* Title */}
            <View style={styles.section}>
                <Text style={styles.label}>
                    Título <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Resuma sua experiência"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                />
            </View>

            {/* Comment */}
            <View style={styles.section}>
                <Text style={styles.label}>
                    Comentário <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Conte-nos mais sobre sua experiência com este produto"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={500}
                />
                <Text style={styles.charCount}>{comment.length}/500</Text>
            </View>

            {/* Detailed Ratings (Optional) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Avaliações Detalhadas (Opcional)</Text>

                <View style={styles.detailedRating}>
                    <Text style={styles.detailedLabel}>Qualidade</Text>
                    <RatingStars
                        rating={qualityRating}
                        readonly={false}
                        size={24}
                        onRatingChange={setQualityRating}
                    />
                </View>

                <View style={styles.detailedRating}>
                    <Text style={styles.detailedLabel}>Entrega</Text>
                    <RatingStars
                        rating={deliveryRating}
                        readonly={false}
                        size={24}
                        onRatingChange={setDeliveryRating}
                    />
                </View>

                <View style={styles.detailedRating}>
                    <Text style={styles.detailedLabel}>Custo-benefício</Text>
                    <RatingStars
                        rating={valueRating}
                        readonly={false}
                        size={24}
                        onRatingChange={setValueRating}
                    />
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    disabled={submitting}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.md,
    },
    productName: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    required: {
        color: colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
        backgroundColor: colors.white,
    },
    textArea: {
        minHeight: 120,
    },
    charCount: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        textAlign: 'right',
        marginTop: spacing.xs,
    },
    detailedRating: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    detailedLabel: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.gray[200],
    },
    cancelButtonText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    submitButton: {
        backgroundColor: colors.primary,
        ...shadows.sm,
    },
    submitButtonText: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.white,
    },
});
