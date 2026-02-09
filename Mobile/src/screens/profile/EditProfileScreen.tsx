// Tela de Edição de Perfil

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
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../theme';

export default function EditProfileScreen({ navigation }: any) {
    const { user, checkAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        dateOfBirth: user?.dateOfBirth || '',
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.firstName.trim()) {
            Alert.alert('Erro', 'Nome é obrigatório');
            return false;
        }
        if (!formData.lastName.trim()) {
            Alert.alert('Erro', 'Sobrenome é obrigatório');
            return false;
        }
        if (!formData.email.trim()) {
            Alert.alert('Erro', 'Email é obrigatório');
            return false;
        }
        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Erro', 'Email inválido');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await authAPI.updateProfile(formData);

            // Atualizar dados do usuário no contexto
            await checkAuth();

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            const message = error.response?.data?.message || 'Não foi possível atualizar o perfil.';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Nome */}
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    placeholder="Seu nome"
                    autoCapitalize="words"
                />

                {/* Sobrenome */}
                <Text style={styles.label}>Sobrenome *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    placeholder="Seu sobrenome"
                    autoCapitalize="words"
                />

                {/* Email */}
                <Text style={styles.label}>Email *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleChange('email', value)}
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Telefone */}
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                    style={styles.input}
                    value={formData.phoneNumber}
                    onChangeText={(value) => handleChange('phoneNumber', value)}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                />

                {/* Data de Nascimento */}
                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput
                    style={styles.input}
                    value={formData.dateOfBirth}
                    onChangeText={(value) => handleChange('dateOfBirth', value)}
                    placeholder="DD/MM/AAAA"
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
                        <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
