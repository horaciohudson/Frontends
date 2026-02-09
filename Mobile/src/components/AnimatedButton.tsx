// Componente AnimatedButton - Botão com feedback visual

import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, ViewStyle } from 'react-native';
import { scale } from '../utils/animations';

interface AnimatedButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    disabled?: boolean;
}

export default function AnimatedButton({ onPress, children, style, disabled }: AnimatedButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        scale(scaleAnim, 0.95, 100).start();
    };

    const handlePressOut = () => {
        scale(scaleAnim, 1, 100).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
}
