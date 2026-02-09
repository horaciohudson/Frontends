// Componente SkeletonLoader para feedback de carregamento

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function SkeletonItem({ width = '100%', height = 20, borderRadius: radius = 4, style }: SkeletonLoaderProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: radius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

// Skeleton para ProductCard
export function ProductCardSkeleton() {
    return (
        <View style={styles.productCard}>
            <SkeletonItem width="100%" height={200} borderRadius={borderRadius.lg} />
            <View style={styles.productInfo}>
                <SkeletonItem width="80%" height={16} style={{ marginBottom: spacing.xs }} />
                <SkeletonItem width="60%" height={14} style={{ marginBottom: spacing.xs }} />
                <SkeletonItem width="40%" height={20} />
            </View>
        </View>
    );
}

// Skeleton para lista genérica
export function ListItemSkeleton() {
    return (
        <View style={styles.listItem}>
            <SkeletonItem width={60} height={60} borderRadius={borderRadius.md} />
            <View style={styles.listItemContent}>
                <SkeletonItem width="70%" height={16} style={{ marginBottom: spacing.xs }} />
                <SkeletonItem width="50%" height={14} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: colors.gray[300],
    },
    productCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    productInfo: {
        padding: spacing.md,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
    },
    listItemContent: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
});

export default SkeletonItem;
