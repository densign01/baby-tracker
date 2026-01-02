// ===== Simple Theme - Swaddle Modern Minimal =====

// Colors - Pure white with subtle warm beige accents
export const colors = {
    primary: '#B39574',        // Soft tan - primary brand
    primaryLight: '#D4C4B0',   // Light tan
    primaryDark: '#8B7355',    // Dark tan

    // Warm accent (matches icon)
    accent: '#C4A98B',
    accentLight: '#E8DDD0',
    accentDark: '#9A7D5E',

    background: '#FFFFFF',     // Pure white background
    backgroundSecondary: '#FAFAFA',
    card: '#FFFFFF',
    cardBorder: '#F0EEEC',     // Very subtle warm gray border

    text: '#3A3634',           // Warm charcoal
    textSecondary: '#6B6562',  // Warm gray
    textMuted: '#A8A09A',      // Light warm gray

    border: '#F0EEEC',
    inputBackground: '#FAFAFA',

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

// Shadows - softer for minimal look
export const shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
};

// Gradients - warm neutral tones
export const gradients = {
    sleep: ['#8B7B6B', '#6B5B4B'] as const,      // Warm taupe
    feeding: ['#C4A98B', '#B39574'] as const,    // Soft tan
    pee: ['#7BA3C4', '#5B8AB0'] as const,        // Dusty blue
    poop: ['#A8957D', '#8B7D65'] as const,       // Warm brown
    header: ['#C4A98B', '#B39574'] as const,     // Warm tan
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
