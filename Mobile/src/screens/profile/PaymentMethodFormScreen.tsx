// Tela de Formulário para Adicionar Método de Pagamento

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { paymentMethodsAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';

export default function PaymentMethodFormScreen({ route, navigation }: any) {
    const { onSave } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        nickname: '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted;
    };

    const validateForm = (): boolean => {
        const cardNumber = formData.cardNumber.replace(/\s/g, '');

        if (cardNumber.length < 13 || cardNumber.length > 19) {
            Alert.alert('Erro', 'Número de cartão inválido');
            return false;
        }
        if (!formData.cardholderName.trim()) {
            Alert.alert('Erro', 'Nome do titular é obrigatório');
            return false;
        }
        const month = parseInt(formData.expiryMonth);
        if (!month || month < 1 || month > 12) {
            Alert.alert('Erro', 'Mês de validade inválido');
            return false;
        }
        const year = parseInt(formData.expiryYear);
        if (!year || year < 2024) {
            Alert.alert('Erro', 'Ano de validade inválido');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const data = {
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                cardholderName: formData.cardholderName,
                expiryMonth: parseInt(formData.expiryMonth),
                expiryYear: parseInt(formData.expiryYear),
                nickname: formData.nickname || null,
                isDefault: false,
            };

            await paymentMethodsAPI.create(data);
            Alert.alert('Sucesso', 'Cartão adicionado com sucesso!', [
                {
                    text: 'OK', onPress: () => {
                        if (onSave) onSave();
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error: any) {
            console.error('Erro ao adicionar cartão:', error);
            const message = error.response?.data?.message || 'Não foi possível adicionar o cartão.';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.warning}>
                    ⚠️ Seus dados são criptografados e armazenados de forma segura
                </Text>

                {/* Número do Cartão */}
                <Text style={styles.label}>Número do Cartão *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.cardNumber}
                    onChangeText={(value) => handleChange('cardNumber', formatCardNumber(value))}
                    placeholder="0000 0000 0000 0000"
                    keyboardType="numeric"
                    maxLength={19}
                />

                {/* Nome do Titular */}
                <Text style={styles.label}>Nome do Titular *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.cardholderName}
                    onChangeText={(value) => handleChange('cardholderName', value.toUpperCase())}
                    placeholder="NOME COMO NO CARTÃO"
                    autoCapitalize="characters"
                />

                {/* Validade */}
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Text style={styles.label}>Mês *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.expiryMonth}
                            onChangeText={(value) => handleChange('expiryMonth', value)}
                            placeholder="MM"
                            keyboardType="numeric"
                            maxLength={2}
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Text style={styles.label}>Ano *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.expiryYear}
                            onChangeText={(value) => handleChange('expiryYear', value)}
                            placeholder="AAAA"
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    </View>
                </View>

                {/* Apelido */}
                <Text style={styles.label}>Apelido (Opcional)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.nickname}
                    onChangeText={(value) => handleChange('nickname', value)}
                    placeholder="Ex: Cartão pessoal"
                />

                <Text style={styles.hint}>
                    * Campos obrigatórios
                </Text>
            </ScrollView>

            {/* Botão Salvar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Adicionar Cartão</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
    },
    warning: {
        backgroundColor: colors.warning + '20',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        fontSize: fontSize.sm,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    hint: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.md,
        fontStyle: 'italic',
    },
    footer: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.lg,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
