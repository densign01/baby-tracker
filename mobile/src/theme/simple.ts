// ===== Simple Theme - Static Colors =====

// Colors
export const colors = {
    primary: '#7C6FEA',
    primaryLight: '#C4B5FD',
    primaryDark: '#5B4ED1',

    // Sprout green accent (matches icon)
    accent: '#4ADE80',
    accentLight: '#86EFAC',
    accentDark: '#22C55E',

    background: '#F8F9FE',
    backgroundSecondary: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',

    text: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    border: '#E2E8F0',
    inputBackground: '#FFFFFF',

    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    white: '#FFFFFF',
    black: '#000000',
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Border radius
export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
};

// Font sizes
export const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Shadows
export const shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
};

// Gradients for activity cards
export const gradients = {
    sleep: ['#667eea', '#764ba2'] as const,
    feeding: ['#f093fb', '#f5576c'] as const,
    pee: ['#4facfe', '#00f2fe'] as const,
    poop: ['#fa709a', '#fee140'] as const,
    header: ['#667eea', '#764ba2'] as const,
};

// Simple theme object
export const theme = {
    colors,
    spacing,
    radius,
    fontSize,
    shadow,
    gradients,
};

export default theme;
