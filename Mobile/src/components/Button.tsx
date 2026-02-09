// Componente Button Reutilizável

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    textStyle,
}: ButtonProps) {
    const getButtonStyle = () => {
        const baseStyle = [styles.button];

        if (fullWidth) baseStyle.push(styles.fullWidth);

        switch (variant) {
            case 'secondary':
                baseStyle.push(styles.secondary);
                break;
            case 'danger':
                baseStyle.push(styles.danger);
                break;
            default:
                baseStyle.push(styles.primary);
        }

        if (disabled || loading) baseStyle.push(styles.disabled);
        if (style) baseStyle.push(style);

        return baseStyle;
    };

    const getTextStyle = () => {
        const baseStyle = [styles.text];

        switch (variant) {
            case 'secondary':
                baseStyle.push(styles.secondaryText);
                break;
            default:
                baseStyle.push(styles.primaryText);
        }

        if (textStyle) baseStyle.push(textStyle);

        return baseStyle;
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    fullWidth: {
        width: '100%',
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    danger: {
        backgroundColor: colors.error,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.primary,
    },
});
