// Componente EmptyState Reutilizável

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import Button from './Button';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon,
    title,
    message,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    style={styles.button}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    icon: {
        fontSize: 60,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize.md,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    button: {
        minWidth: 200,
    },
});
