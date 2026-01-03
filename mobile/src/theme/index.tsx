// ===== Theme Provider =====

import React, { createContext, useContext, ReactNode } from 'react';
import { createThemeColors, gradients, palette } from './colors';
import { spacing, radius, fontSize, fontWeight, shadow, hitSlop } from './spacing';
import { useSettingsStore } from '../store/settingsStore';

export type ThemeColors = ReturnType<typeof createThemeColors>;

export interface Theme {
    colors: ThemeColors;
    gradients: typeof gradients;
    spacing: typeof spacing;
    radius: typeof radius;
    fontSize: typeof fontSize;
    fontWeight: typeof fontWeight;
    shadow: typeof shadow;
    hitSlop: typeof hitSlop;
    isDark: boolean;
    colorScheme: 'neutral' | 'boy' | 'girl';
}

const ThemeContext = createContext<Theme | null>(null);

export const useTheme = (): Theme => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const { theme: themeMode, colorScheme } = useSettingsStore();
    const isDark = themeMode === 'dark';

    const theme: Theme = {
        colors: createThemeColors(colorScheme, isDark),
        gradients,
        spacing,
        radius,
        fontSize,
        fontWeight,
        shadow,
        hitSlop,
        isDark,
        colorScheme,
    };

    return (
        <ThemeContext.Provider value= { theme } >
        { children }
        </ThemeContext.Provider>
  );
};

// Re-export everything
export { palette, gradients } from './colors';
export * from './spacing';
