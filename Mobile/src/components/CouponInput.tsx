// Componente CouponInput - Input para Código de Cupom

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius, shadows } from '../theme';

interface CouponInputProps {
    onApply: (code: string) => Promise<void>;
    disabled?: boolean;
}

export default function CouponInput({ onApply, disabled = false }: CouponInputProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (!code.trim()) return;

        try {
            setLoading(true);
            await onApply(code.trim().toUpperCase());
            setCode(''); // Limpar após aplicar
        } catch (error) {
            console.error('Error applying coupon:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Cupom de Desconto</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o código"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="characters"
                    editable={!disabled && !loading}
                />
                <TouchableOpacity
                    style={[
                        styles.applyButton,
                        (disabled || loading || !code.trim()) && styles.buttonDisabled,
                    ]}
                    onPress={handleApply}
                    disabled={disabled || loading || !code.trim()}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.applyButtonText}>Aplicar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.text.primary,
        backgroundColor: colors.white,
    },
    applyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 90,
    },
    applyButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
