import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Sun, Moon, Zap, Droplets } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeCustomizer.css';

const presets = [
    {
        name: 'Midnight',
        settings: { primary: '#6366f1', primaryDark: '#4f46e5', bgGradientStart: '#1e1b4b', bgGradientEnd: '#0f172a', glassBlur: '40px' }
    },
    {
        name: 'Cyberpunk',
        settings: { primary: '#f472b6', primaryDark: '#db2777', bgGradientStart: '#1e1b4b', bgGradientEnd: '#09090b', glassBlur: '20px' }
    },
    {
        name: 'Oceanic',
        settings: { primary: '#0ea5e9', primaryDark: '#0284c7', bgGradientStart: '#0c4a6e', bgGradientEnd: '#082f49', glassBlur: '30px' }
    },
    {
        name: 'Emerald',
        settings: { primary: '#10b981', primaryDark: '#059669', bgGradientStart: '#064e3b', bgGradientEnd: '#022c22', glassBlur: '25px' }
    }
];

const ThemeCustomizer = ({ isOpen, onClose }) => {
    const { theme, updateTheme } = useTheme();

    const handleColorChange = (key, value) => {
        updateTheme({ [key]: value });
    };

    const handleSliderChange = (key, value) => {
        const val = key === 'glassBlur' ? `${value}px` : value;
        updateTheme({ [key]: val });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        className="customizer-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div 
                        className="customizer-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="customizer-header">
                            <h3><Palette size={20} /> Personalize Theme</h3>
                            <button className="close-btn" onClick={onClose}><X size={20} /></button>
                        </div>

                        <div className="customizer-content">
                            <section className="customizer-section">
                                <h4>Presets</h4>
                                <div className="presets-grid">
                                    {presets.map(p => (
                                        <button 
                                            key={p.name} 
                                            className="preset-btn"
                                            onClick={() => updateTheme(p.settings)}
                                            style={{ borderColor: p.settings.primary }}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="customizer-section">
                                <h4>Accent Color</h4>
                                <div className="color-control">
                                    <input 
                                        type="color" 
                                        value={theme.primary} 
                                        onChange={(e) => handleColorChange('primary', e.target.value)} 
                                    />
                                    <span>{theme.primary}</span>
                                </div>
                            </section>

                            <section className="customizer-section">
                                <h4>Background Gradient</h4>
                                <div className="color-control">
                                    <label>Start</label>
                                    <input 
                                        type="color" 
                                        value={theme.bgGradientStart} 
                                        onChange={(e) => handleColorChange('bgGradientStart', e.target.value)} 
                                    />
                                </div>
                                <div className="color-control">
                                    <label>End</label>
                                    <input 
                                        type="color" 
                                        value={theme.bgGradientEnd} 
                                        onChange={(e) => handleColorChange('bgGradientEnd', e.target.value)} 
                                    />
                                </div>
                            </section>

                            <section className="customizer-section">
                                <h4>Glass Intensity</h4>
                                <div className="range-control">
                                    <label>Blur: {theme.glassBlur}</label>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={parseInt(theme.glassBlur)} 
                                        onChange={(e) => handleSliderChange('glassBlur', e.target.value)} 
                                    />
                                </div>
                                <div className="range-control">
                                    <label>Opacity: {theme.glassOpacity}</label>
                                    <input 
                                        type="range" 
                                        min="0.1" max="1" step="0.1" 
                                        value={theme.glassOpacity} 
                                        onChange={(e) => handleSliderChange('glassOpacity', e.target.value)} 
                                    />
                                </div>
                            </section>
                        </div>

                        <div className="customizer-footer">
                            <button className="save-theme-btn">Save to Profile</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ThemeCustomizer;
