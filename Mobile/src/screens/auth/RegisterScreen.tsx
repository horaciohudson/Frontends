// Tela de Registro

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../../theme';

export default function RegisterScreen({ navigation }: any) {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.firstName.trim()) {
            Alert.alert('Erro', 'Por favor, informe seu nome.');
            return false;
        }
        if (!formData.lastName.trim()) {
            Alert.alert('Erro', 'Por favor, informe seu sobrenome.');
            return false;
        }
        if (!formData.username.trim()) {
            Alert.alert('Erro', 'Por favor, escolha um nome de usuário.');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            Alert.alert('Erro', 'Por favor, informe um email válido.');
            return false;
        }
        if (formData.password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Erro', 'As senhas não conferem.');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await register({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });
            Alert.alert(
                'Sucesso',
                'Conta criada com sucesso! Faça login para continuar.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            console.error('Erro no registro:', error);
            const message = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Preencha os dados abaixo</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.firstName}
                                onChangeText={(v) => updateField('firstName', v)}
                                editable={!loading}
                            />
                        </View>
                        <View style={[styles.inputContainer, styles.halfWidth]}>
                            <Text style={styles.label}>Sobrenome</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Sobrenome"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.lastName}
                                onChangeText={(v) => updateField('lastName', v)}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Usuário</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Escolha um nome de usuário"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.username}
                            onChangeText={(v) => updateField('username', v)}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.email}
                            onChangeText={(v) => updateField('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.password}
                                onChangeText={(v) => updateField('password', v)}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirmar Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Repita a senha"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.confirmPassword}
                            onChangeText={(v) => updateField('confirmPassword', v)}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Criar Conta</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Já tem uma conta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Fazer login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingTop: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
    },
    form: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.gray[50],
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.lg,
        gap: spacing.xs,
    },
    footerText: {
        color: colors.text.secondary,
        fontSize: fontSize.md,
    },
    linkText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
});
