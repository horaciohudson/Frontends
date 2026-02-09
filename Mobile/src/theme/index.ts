// Tema global do app SigeveClaud Mobile
// Baseado no frontend web

export const colors = {
    // Cores primárias
    primary: '#2563eb',        // Azul principal
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',

    // Cores de destaque
    accent: '#dc2626',         // Vermelho para promoções/descontos
    accentLight: '#ef4444',

    // Cores de sucesso/erro/aviso
    success: '#16a34a',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#0891b2',

    // Cores neutras
    white: '#ffffff',
    black: '#000000',
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },

    // Background
    background: '#f9fafb',
    surface: '#ffffff',

    // Texto
    text: {
        primary: '#111827',
        secondary: '#6b7280',
        disabled: '#9ca3af',
        inverse: '#ffffff',
    },

    // Bordas
    border: '#e5e7eb',
    borderFocus: '#2563eb',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
};

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
};

const theme = {
    colors,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    shadows,
};

export default theme;
