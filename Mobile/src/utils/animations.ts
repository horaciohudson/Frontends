// Utilitários de Animação Reutilizáveis

import { Animated, Easing } from 'react-native';

/**
 * Fade In Animation
 * Anima opacidade de 0 para 1
 */
export const fadeIn = (
    animatedValue: Animated.Value,
    duration: number = 300,
    delay: number = 0
): Animated.CompositeAnimation => {
    return Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
    });
};

/**
 * Fade Out Animation
 * Anima opacidade de 1 para 0
 */
export const fadeOut = (
    animatedValue: Animated.Value,
    duration: number = 300,
    delay: number = 0
): Animated.CompositeAnimation => {
    return Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
    });
};

/**
 * Scale Animation
 * Anima escala (útil para botões)
 */
export const scale = (
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 200
): Animated.CompositeAnimation => {
    return Animated.spring(animatedValue, {
        toValue,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
    });
};

/**
 * Bounce Animation
 * Animação de "pulo" para feedback visual
 */
export const bounce = (
    animatedValue: Animated.Value,
    duration: number = 400
): Animated.CompositeAnimation => {
    return Animated.sequence([
        Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: duration / 2,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }),
    ]);
};

/**
 * Slide In From Bottom
 * Anima entrada de baixo para cima
 */
export const slideInFromBottom = (
    animatedValue: Animated.Value,
    duration: number = 300,
    delay: number = 0
): Animated.CompositeAnimation => {
    return Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
    });
};

/**
 * Pulse Animation
 * Animação de pulso contínua
 */
export const pulse = (
    animatedValue: Animated.Value,
    minScale: number = 0.95,
    maxScale: number = 1.05,
    duration: number = 1000
): Animated.CompositeAnimation => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: maxScale,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: minScale,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

/**
 * Stagger Animation
 * Anima múltiplos elementos em sequência
 */
export const stagger = (
    animations: Animated.CompositeAnimation[],
    delay: number = 100
): Animated.CompositeAnimation => {
    return Animated.stagger(delay, animations);
};
