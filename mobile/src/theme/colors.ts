// ===== Color System =====

export const palette = {
    // Neutrals
    white: '#FFFFFF',
    black: '#000000',

    // Grays
    gray50: '#F8F9FE',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',

    // Purple (Neutral theme)
    purple50: '#F5F3FF',
    purple100: '#EDE9FE',
    purple200: '#DDD6FE',
    purple300: '#C4B5FD',
    purple400: '#A78BFA',
    purple500: '#7C6FEA',
    purple600: '#6D5DD3',
    purple700: '#5D4ED6',
    purple800: '#4C3DB8',
    purple900: '#3B2F8A',

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
    const primary = scheme === 'boy' ? palette.blue500 :
        scheme === 'girl' ? palette.pink500 :
            palette.purple500;

    const primaryLight = scheme === 'boy' ? palette.blue300 :
        scheme === 'girl' ? palette.pink300 :
            palette.purple300;

    const primaryDark = scheme === 'boy' ? palette.blue700 :
        scheme === 'girl' ? palette.pink700 :
            palette.purple700;

    if (isDark) {
        return {
            primary,
            primaryLight,
            primaryDark,
            background: '#1A1A2E',
            backgroundSecondary: '#16162A',
            card: '#25253B',
            cardBorder: '#35354B',
            text: '#EAEAEA',
            textSecondary: '#A0AEC0',
            textMuted: '#718096',
            border: '#35354B',
            inputBackground: '#25253B',
            overlay: 'rgba(0, 0, 0, 0.7)',
            success: palette.success,
            warning: palette.warning,
            error: palette.error,
            info: palette.info,
        };
    }

    return {
        primary,
        primaryLight,
        primaryDark,
        background: palette.gray50,
        backgroundSecondary: palette.white,
        card: palette.white,
        cardBorder: palette.gray200,
        text: palette.gray800,
        textSecondary: palette.gray600,
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

// Gradient definitions for activity cards
export const gradients = {
    sleep: {
        colors: ['#667eea', '#764ba2'] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    feeding: {
        colors: ['#f093fb', '#f5576c'] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    pee: {
        colors: ['#4facfe', '#00f2fe'] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    poop: {
        colors: ['#fa709a', '#fee140'] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
    },
    header: {
        neutral: ['#667eea', '#764ba2'] as const,
        boy: ['#4facfe', '#00f2fe'] as const,
        girl: ['#f093fb', '#f5576c'] as const,
    },
};

export { createThemeColors };
