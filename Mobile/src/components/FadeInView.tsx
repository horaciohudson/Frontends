// Componente FadeInView - Container com animação de fade-in

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { fadeIn } from '../utils/animations';

interface FadeInViewProps {
    children: React.ReactNode;
    duration?: number;
    delay?: number;
    style?: ViewStyle | ViewStyle[];
}

export default function FadeInView({ children, duration = 300, delay = 0, style }: FadeInViewProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeIn(fadeAnim, duration, delay).start();
    }, []);

    return (
        <Animated.View style={[style, { opacity: fadeAnim }]}>
            {children}
        </Animated.View>
    );
}
