// Componente Input Reutilizável

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    type?: 'text' | 'password' | 'email' | 'number';
}

export default function Input({
    label,
    error,
    type = 'text',
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'number':
                return 'numeric';
            default:
                return 'default';
        }
    };

    const getAutoCapitalize = () => {
        if (type === 'email') return 'none';
        return props.autoCapitalize || 'sentences';
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, error && styles.inputError]}
                    keyboardType={getKeyboardType()}
                    autoCapitalize={getAutoCapitalize()}
                    secureTextEntry={type === 'password' && !showPassword}
                    placeholderTextColor={colors.text.secondary}
                    {...props}
                />

                {type === 'password' && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        position: 'relative',
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
    inputError: {
        borderColor: colors.error,
    },
    eyeButton: {
        position: 'absolute',
        right: spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    eyeIcon: {
        fontSize: 20,
    },
    error: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
