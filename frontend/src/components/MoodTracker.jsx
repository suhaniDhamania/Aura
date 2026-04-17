import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import moodService from '../api/moodService';
import { useTheme } from '../context/ThemeContext';
import './MoodTracker.css';

const moodConfig = {
    awesome: { icon: '🤩', label: 'Awesome', color: '#10b981' }, // Emerald
    good: { icon: '🙂', label: 'Good', color: '#0ea5e9' }, // Ocean
    energetic: { icon: '⚡', label: 'Energetic', color: '#8b5cf6' }, // Purple
    neutral: { icon: '😐', label: 'Neutral', color: '#64748b' }, // Slate
    sad: { icon: '😔', label: 'Sad', color: '#f43f5e' }, // Rose
    stressed: { icon: '😫', label: 'Stressed', color: '#f59e0b' } // Amber
};

const MoodTracker = ({ onMoodLogged }) => {
    const { updateTheme } = useTheme();
    const [selectedMood, setSelectedMood] = useState(null);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await moodService.getMoodHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to load mood history", error);
        }
    };

    const handleMoodSelect = (moodKey) => {
        setSelectedMood(moodKey);
        // Automatically shift the whole application's Aura based on the mood!
        updateTheme({ 
            primary: moodConfig[moodKey].color,
            glassBlur: moodKey === 'energetic' ? '15px' : '30px' // Energetic makes it sharper! 
        });
    };

    const handleLogMood = async (e) => {
        e.preventDefault();
        if (!selectedMood) return toast.error("Please select an Aura / Mood first.");

        setIsSubmitting(true);
        const toastId = toast.loading('Synchronizing your Aura...');

        try {
            await moodService.logMood({ moodType: selectedMood, note });
            toast.success("Aura logged successfully!", { id: toastId });
            setNote('');
            fetchHistory();
            if (onMoodLogged) onMoodLogged(); 
        } catch (error) {
            toast.error(error.message || 'Failed to log mood', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate a 30-day block grid for the heatmap
    const today = new Date();
    today.setHours(0,0,0,0);
    const daysArray = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i)); // 29 days ago up to today
        const dateStr = d.toISOString().split('T')[0];
        
        // Find if user logged a mood on this date string
        const entry = history.find(h => h.date === dateStr);
        return {
            dateStr,
            entry
        };
    });

    return (
        <div className="mood-tracker-container">
            <motion.div 
                className="mood-logger-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="card-header-sparkle">
                    <Sparkles size={24} style={{color: selectedMood ? moodConfig[selectedMood].color : 'var(--primary)'}} />
                    <h3>Daily Aura Pulse</h3>
                </div>
                <p className="mood-subtitle">How is your energy vibrating today?</p>
                
                <form onSubmit={handleLogMood}>
                    <div className="mood-selector-grid">
                        {Object.entries(moodConfig).map(([key, data]) => (
                            <button
                                type="button"
                                key={key}
                                className={`mood-btn ${selectedMood === key ? 'selected' : ''}`}
                                style={{
                                    '--mood-color': data.color,
                                    borderColor: selectedMood === key ? data.color : 'transparent',
                                    backgroundColor: selectedMood === key ? `${data.color}22` : 'rgba(255,255,255,0.03)'
                                }}
                                onClick={() => handleMoodSelect(key)}
                            >
                                <span className="mood-icon">{data.icon}</span>
                                <span className="mood-label">{data.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="note-input-container">
                        <PenTool size={16} className="note-icon" />
                        <input 
                            type="text" 
                            placeholder="Add a short note about your day (optional)..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            maxLength={100}
                            className="mood-note-input"
                        />
                    </div>

                    <button type="submit" className="log-aura-btn" disabled={isSubmitting || !selectedMood}>
                        {isSubmitting ? 'Syncing...' : 'Log Today\'s Aura'}
                    </button>
                </form>
            </motion.div>

            <motion.div 
                className="mood-heatmap-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="heatmap-header">
                    <h4><Calendar size={18} /> 30-Day Aura Map</h4>
                    <span className="heatmap-stats">{history.length} pulses logged</span>
                </div>
                <div className="heatmap-grid" title="Hover over days to see details">
                    {daysArray.map((day, idx) => {
                        const color = day.entry ? moodConfig[day.entry.moodType].color : 'rgba(255, 255, 255, 0.05)';
                        const glow = day.entry ? `0 0 10px ${color}88` : 'none';

                        return (
                            <div 
                                key={idx} 
                                className="heatmap-block"
                                style={{ backgroundColor: color, boxShadow: glow }}
                                title={`${day.dateStr}${day.entry ? ` - ${moodConfig[day.entry.moodType].label}` : ' - No log'}`}
                            ></div>
                        );
                    })}
                </div>
                <div className="heatmap-legend">
                    Less energy <span className="legend-gradient"></span> High energy
                </div>
            </motion.div>
        </div>
    );
};

export default MoodTracker;
