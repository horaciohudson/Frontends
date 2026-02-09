// Tela de Login

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

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            setLoading(true);
            await login(username.trim(), password);
            // Navegação automática pelo AppNavigator quando isAuthenticated mudar
        } catch (error: any) {
            console.error('Erro no login:', error);
            const message = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
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
                    <Text style={styles.logo}>🛍️</Text>
                    <Text style={styles.title}>SigeveClaud</Text>
                    <Text style={styles.subtitle}>Entre na sua conta</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Usuário</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu usuário"
                            placeholderTextColor={colors.gray[400]}
                            value={username}
                            onChangeText={setUsername}
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
                                placeholder="Digite sua senha"
                                placeholderTextColor={colors.gray[400]}
                                value={password}
                                onChangeText={setPassword}
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

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Não tem uma conta?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Criar conta</Text>
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
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logo: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: fontSize.lg,
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
        marginTop: spacing.xl,
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
