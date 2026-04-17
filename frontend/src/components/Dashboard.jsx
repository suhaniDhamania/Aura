import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Settings, Bell, Search, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeCustomizer from './ThemeCustomizer';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <motion.div 
                className="sidebar"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="sidebar-logo">
                    <div className="logo-icon">A</div>
                    <span>Antigravity</span>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-item active"><LayoutDashboard size={20} /> Dashboard</div>
                    <div className="nav-item"><User size={20} /> Profile</div>
                    <div className="nav-item"><Bell size={20} /> Notifications</div>
                    <div className="nav-item" onClick={() => setIsCustomizerOpen(true)}><Palette size={20} /> Personalize</div>
                    <div className="nav-item"><Settings size={20} /> Settings</div>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="main-content">
                <header className="content-header">
                    <div className="search-bar">
                        <Search size={18} />
                        <input type="text" placeholder="Search anything..." />
                    </div>
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{user?.username || 'User'}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <div className="user-avatar">
                            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>
                </header>

                <main className="dashboard-view">
                    <motion.div 
                        className="welcome-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1>Welcome back, <span className="highlight">{user?.username || 'User'}</span>!</h1>
                        <p>Everything looks great today. You have 3 new notifications.</p>
                    </motion.div>

                    <div className="stats-grid">
                        {[1, 2, 3].map((item) => (
                            <motion.div 
                                key={item}
                                className="stat-card"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 * item + 0.3 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="stat-icon">📈</div>
                                <div className="stat-info">
                                    <span className="stat-label">Analytics {item}</span>
                                    <span className="stat-value">+{12 * item}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div 
                        className="recent-activity"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3>Recent Activity</h3>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-dot"></div>
                                <div className="activity-text">Successful login from New Delhi, India</div>
                                <span className="activity-time">Just now</span>
                            </div>
                            <div className="activity-item">
                                <div className="activity-dot"></div>
                                <div className="activity-text">Profile information updated</div>
                                <span className="activity-time">2 hours ago</span>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>

            <ThemeCustomizer 
                isOpen={isCustomizerOpen} 
                onClose={() => setIsCustomizerOpen(false)} 
            />
        </div>
    );
};

export default Dashboard;
