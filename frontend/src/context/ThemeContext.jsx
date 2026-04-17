import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const defaultTheme = {
            primary: '#6366f1',
            primaryDark: '#4f46e5',
            bgGradientStart: '#1e1b4b',
            bgGradientEnd: '#0f172a',
            glassBlur: '40px',
            glassOpacity: '0.7',
            cardBorder: 'rgba(255, 255, 255, 0.1)',
            cardGlow: 'rgba(99, 102, 241, 0.1)',
            textPrimary: '#f8fafc',
            textSecondary: '#94a3b8'
        };
        
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                if (userObj && userObj.themeConfig && Object.keys(userObj.themeConfig).length > 0) {
                    return { ...defaultTheme, ...userObj.themeConfig };
                }
            }
        } catch (e) {
            console.error('Error parsing theme from storage:', e);
        }
        
        return defaultTheme;
    });

    // Apply theme changes to CSS variables
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--bg-gradient-start', theme.bgGradientStart);
        root.style.setProperty('--bg-gradient-end', theme.bgGradientEnd);
        root.style.setProperty('--glass-blur', theme.glassBlur);
        root.style.setProperty('--glass-opacity', theme.glassOpacity);
        root.style.setProperty('--card-border', theme.cardBorder);
        root.style.setProperty('--card-glow', theme.cardGlow);
        root.style.setProperty('--text-primary', theme.textPrimary);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        
        // Derived variable for easier gradient usage
        root.style.setProperty('--bg-gradient', `radial-gradient(circle at 50% 50%, ${theme.bgGradientStart} 0%, ${theme.bgGradientEnd} 100%)`);
        root.style.setProperty('--bg-card', `rgba(30, 41, 59, ${theme.glassOpacity})`);
    }, [theme]);

    const updateTheme = (newSettings) => {
        setTheme(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
