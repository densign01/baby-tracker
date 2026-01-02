// ===== Color System =====
// Swaddle Branding: Warm Neutrals (Softer Neutrals palette)

export const palette = {
    // Core Neutrals
    white: '#FFFFFF',
    black: '#000000',

    // Warm Grays (cream-tinted)
    gray50: '#FBF9F7',   // Light cream background
    gray100: '#F5F2EF',  // Soft cream
    gray200: '#E8E4E0',  // Light warm gray border
    gray300: '#D4CFC9',  // Warm gray
    gray400: '#A8A09A',  // Muted warm gray
    gray500: '#7D7572',  // Warm gray text secondary
    gray600: '#5C5653',  // Warm charcoal
    gray700: '#4A4543',  // Dark warm charcoal
    gray800: '#3A3634',  // Very dark warm
    gray900: '#2A2726',  // Almost black warm

    // Tan/Beige (Neutral theme - primary brand color)
    tan50: '#FAF7F4',
    tan100: '#F5EFE8',
    tan200: '#E8DDD0',
    tan300: '#D4C4B0',
    tan400: '#C4A98B',   // Primary accent
    tan500: '#B39574',   // Primary
    tan600: '#9A7D5E',
    tan700: '#7D6349',
    tan800: '#5F4A36',
    tan900: '#403224',

    // Blue (Boy theme)
    blue50: '#EFF6FF',
    blue100: '#DBEAFE',
    blue200: '#BFDBFE',
    blue300: '#93C5FD',
    blue400: '#60A5FA',
    blue500: '#4A90D9',
    blue600: '#2563EB',
    blue700: '#1D4ED8',
    blue800: '#1E40AF',
    blue900: '#1E3A8A',

    // Pink (Girl theme)
    pink50: '#FDF2F8',
    pink100: '#FCE7F3',
    pink200: '#FBCFE8',
    pink300: '#F9A8D4',
    pink400: '#F472B6',
    pink500: '#E875A0',
    pink600: '#DB2777',
    pink700: '#BE185D',
    pink800: '#9D174D',
    pink900: '#831843',

    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
};

export type ColorScheme = 'neutral' | 'boy' | 'girl';

const createThemeColors = (scheme: ColorScheme, isDark: boolean) => {
    // Primary colors based on scheme
    const primary = scheme === 'boy' ? palette.blue500 :
        scheme === 'girl' ? palette.pink500 :
            palette.tan500;

    const primaryLight = scheme === 'boy' ? palette.blue300 :
        scheme === 'girl' ? palette.pink300 :
            palette.tan300;

    const primaryDark = scheme === 'boy' ? palette.blue700 :
        scheme === 'girl' ? palette.pink700 :
            palette.tan700;

    if (isDark) {
        return {
            primary,
            primaryLight,
            primaryDark,
            background: '#1F1D1B',        // Warm dark background
            backgroundSecondary: '#171615',
            card: '#2A2725',              // Warm dark card
            cardBorder: '#3D3936',
            text: '#F5F2EF',
            textSecondary: '#A8A09A',
            textMuted: '#7D7572',
            border: '#3D3936',
            inputBackground: '#2A2725',
            overlay: 'rgba(0, 0, 0, 0.7)',
            success: palette.success,
            warning: palette.warning,
            error: palette.error,
            info: palette.info,
        };
    }

    // Light theme - Softer Neutrals
    return {
        primary,
        primaryLight,
        primaryDark,
        background: palette.gray50,      // Light cream
        backgroundSecondary: palette.white,
        card: palette.white,             // White cards
        cardBorder: palette.gray200,     // Warm gray border
        text: palette.gray700,           // Warm charcoal text
        textSecondary: palette.gray500,  // Warm gray secondary
        textMuted: palette.gray400,
        border: palette.gray200,
        inputBackground: palette.white,
        overlay: 'rgba(0, 0, 0, 0.5)',
        success: palette.success,
        warning: palette.warning,
        error: palette.error,
        info: palette.info,
    };
};

// Gradient definitions for activity cards (warm neutral tones)
export const gradients = {
    sleep: {
        colors: ['#8B7B6B', '#6B5B4B'] as const,  // Warm taupe
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    feeding: {
        colors: ['#C4A98B', '#B39574'] as const,  // Soft tan
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    pee: {
        colors: ['#7BA3C4', '#5B8AB0'] as const,  // Dusty blue
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    poop: {
        colors: ['#A8957D', '#8B7D65'] as const,  // Warm brown
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    header: {
        neutral: ['#C4A98B', '#A8957D'] as const,  // Warm tan
        boy: ['#7BA3C4', '#5B8AB0'] as const,      // Dusty blue
        girl: ['#C4A0A0', '#B08888'] as const,     // Dusty rose
    },
};

export { createThemeColors };
