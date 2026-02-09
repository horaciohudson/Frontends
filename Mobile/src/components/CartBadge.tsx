// Componente CartBadge Reutilizável

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../theme';

interface CartBadgeProps {
    count: number;
}

export default function CartBadge({ count }: CartBadgeProps) {
    if (count === 0) return null;

    const displayCount = count > 99 ? '99+' : count.toString();

    return (
        <View style={styles.badge}>
            <Text style={styles.text}>{displayCount}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.white,
    },
    text: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: 'bold',
    },
});
