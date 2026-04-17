import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Settings, Bell, Search, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeCustomizer from './ThemeCustomizer';
import ProfileSettings from './ProfileSettings';
import NotificationsPanel from './NotificationsPanel';
import authService from '../api/authService';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            fetchProfile();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        }
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfileData(data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    };

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
                    <span>Aura</span>
                </div>
                
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /> Dashboard</div>
                    <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><User size={20} /> Profile</div>
                    <div className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')} style={{position: 'relative'}}>
                        <Bell size={20} /> 
                        Notifications
                        {profileData?.notifications?.filter(n => !n.isRead).length > 0 && (
                            <span style={{
                                position: 'absolute',
                                right: '15px',
                                background: '#f43f5e',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: 'bold'
                            }}>
                                {profileData.notifications.filter(n => !n.isRead).length}
                            </span>
                        )}
                    </div>
                    <div className="nav-item" onClick={() => setIsCustomizerOpen(true)}><Palette size={20} /> Personalize</div>
                    <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</div>
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
                            <span className="user-name">{profileData?.username || user?.username || 'User'}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <div className="user-avatar" style={{overflow: 'hidden', padding: 0}}>
                            {profileData?.avatar ? (
                                <img src={profileData.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            ) : (
                                user?.username ? user.username.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                    </div>
                </header>

                <main className="dashboard-view">
                    {isLoading ? (
                        <div style={{display:'flex', justifyContent:'center', marginTop:'5rem'}}>Loading dynamically...</div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && (
                                <>
                                    <motion.div 
                                        className="welcome-card"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h1>Welcome back, <span className="highlight">{user?.username || 'User'}</span>!</h1>
                                        <p>Your session is active. You have {profileData?.activities?.length || 0} recorded activities.</p>
                                    </motion.div>

                                    <div className="stats-grid">
                                        <motion.div className="stat-card" whileHover={{ y: -5 }}>
                                            <div className="stat-icon" style={{color: 'var(--primary)'}}>⏱️</div>
                                            <div className="stat-info">
                                                <span className="stat-label">Total Logs</span>
                                                <span className="stat-value">{profileData?.activities?.length || 0}</span>
                                            </div>
                                        </motion.div>
                                        <motion.div className="stat-card" whileHover={{ y: -5 }}>
                                            <div className="stat-icon" style={{color: '#10b981'}}>🛡️</div>
                                            <div className="stat-info">
                                                <span className="stat-label">Security</span>
                                                <span className="stat-value">Optimized</span>
                                            </div>
                                        </motion.div>
                                        <motion.div className="stat-card" whileHover={{ y: -5 }}>
                                            <div className="stat-icon" style={{color: '#f472b6'}}>🎨</div>
                                            <div className="stat-info">
                                                <span className="stat-label">Theme</span>
                                                <span className="stat-value">Personalized</span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <motion.div 
                                        className="recent-activity"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <h3>Recent Activity Timeline</h3>
                                        <div className="activity-list">
                                            {profileData?.activities && profileData.activities.length > 0 ? (
                                                [...profileData.activities].reverse().slice(0, 5).map((act, index) => (
                                                    <div className="activity-item" key={index}>
                                                        <div className="activity-dot" style={{
                                                            background: act.type === 'success' ? '#10b981' : act.type === 'warning' ? '#f59e0b' : 'var(--primary)',
                                                            boxShadow: `0 0 10px ${act.type === 'success' ? '#10b981' : act.type === 'warning' ? '#f59e0b' : 'var(--primary)'}`
                                                        }}></div>
                                                        <div className="activity-text">{act.text}</div>
                                                        <span className="activity-time">{formatTimeAgo(act.createdAt)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{color: 'var(--text-secondary)'}}>No recent activity found.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}

                            {activeTab === 'profile' && (
                                <ProfileSettings 
                                    user={user} 
                                    profileData={profileData} 
                                    onProfileUpdated={fetchProfile} 
                                />
                            )}

                            {activeTab === 'notifications' && (
                                <NotificationsPanel 
                                    notifications={profileData?.notifications} 
                                    onMarkRead={fetchProfile} 
                                />
                            )}

                             {activeTab === 'settings' && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="recent-activity">
                                    <h3>Account Settings</h3>
                                    <p style={{color: 'var(--text-secondary)', marginTop:'1rem'}}>Security, Password reset, and more options will go here.</p>
                                </motion.div>
                            )}
                        </>
                    )}
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
