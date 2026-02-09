// Tela de Formulário de Endereço (Criar/Editar)

import React, { useState, useEffect } from 'react';
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
import { addressesAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';
import type { Address } from '../../types';

const ADDRESS_TYPES = [
    { value: 'SHIPPING', label: 'Entrega' },
    { value: 'BILLING', label: 'Cobrança' },
    { value: 'BOTH', label: 'Ambos' },
];

export default function AddressFormScreen({ route, navigation }: any) {
    const { address, onSave } = route.params || {};
    const isEditing = !!address;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Address>({
        street: address?.street || '',
        number: address?.number || '',
        complement: address?.complement || '',
        neighborhood: address?.neighborhood || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || 'Brasil',
        addressType: address?.addressType || 'SHIPPING',
    });

    const handleChange = (field: keyof Address, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.street.trim()) {
            Alert.alert('Erro', 'Rua é obrigatória');
            return false;
        }
        if (!formData.number.trim()) {
            Alert.alert('Erro', 'Número é obrigatório');
            return false;
        }
        if (!formData.neighborhood.trim()) {
            Alert.alert('Erro', 'Bairro é obrigatório');
            return false;
        }
        if (!formData.city.trim()) {
            Alert.alert('Erro', 'Cidade é obrigatória');
            return false;
        }
        if (!formData.state.trim()) {
            Alert.alert('Erro', 'Estado é obrigatório');
            return false;
        }
        if (!formData.zipCode.trim()) {
            Alert.alert('Erro', 'CEP é obrigatório');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            if (isEditing && address?.id) {
                await addressesAPI.update(address.id, formData);
                Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
            } else {
                await addressesAPI.create(formData);
                Alert.alert('Sucesso', 'Endereço criado com sucesso!');
            }

            if (onSave) onSave();
            navigation.goBack();
        } catch (error: any) {
            console.error('Erro ao salvar endereço:', error);
            const message = error.response?.data?.message || 'Não foi possível salvar o endereço.';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Tipo de Endereço */}
                <Text style={styles.label}>Tipo de Endereço</Text>
                <View style={styles.typeContainer}>
                    {ADDRESS_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type.value}
                            style={[
                                styles.typeButton,
                                formData.addressType === type.value && styles.typeButtonActive,
                            ]}
                            onPress={() => handleChange('addressType', type.value as any)}
                        >
                            <Text
                                style={[
                                    styles.typeButtonText,
                                    formData.addressType === type.value && styles.typeButtonTextActive,
                                ]}
                            >
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* CEP */}
                <Text style={styles.label}>CEP *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.zipCode}
                    onChangeText={(value) => handleChange('zipCode', value)}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    maxLength={9}
                />

                {/* Rua */}
                <Text style={styles.label}>Rua *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.street}
                    onChangeText={(value) => handleChange('street', value)}
                    placeholder="Nome da rua"
                />

                {/* Número e Complemento */}
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Text style={styles.label}>Número *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.number}
                            onChangeText={(value) => handleChange('number', value)}
                            placeholder="123"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Text style={styles.label}>Complemento</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.complement}
                            onChangeText={(value) => handleChange('complement', value)}
                            placeholder="Apto, Bloco, etc"
                        />
                    </View>
                </View>

                {/* Bairro */}
                <Text style={styles.label}>Bairro *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.neighborhood}
                    onChangeText={(value) => handleChange('neighborhood', value)}
                    placeholder="Nome do bairro"
                />

                {/* Cidade e Estado */}
                <View style={styles.row}>
                    <View style={[styles.halfWidth, { flex: 2 }]}>
                        <Text style={styles.label}>Cidade *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.city}
                            onChangeText={(value) => handleChange('city', value)}
                            placeholder="Nome da cidade"
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Text style={styles.label}>Estado *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.state}
                            onChangeText={(value) => handleChange('state', value)}
                            placeholder="UF"
                            maxLength={2}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                {/* País */}
                <Text style={styles.label}>País</Text>
                <TextInput
                    style={styles.input}
                    value={formData.country}
                    onChangeText={(value) => handleChange('country', value)}
                    placeholder="País"
                />
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
                        <Text style={styles.saveButtonText}>
                            {isEditing ? 'Atualizar Endereço' : 'Salvar Endereço'}
                        </Text>
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
    typeContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    typeButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeButtonText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: colors.white,
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
