import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckSquare, Info, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../api/authService';
import './NotificationsPanel.css';

const NotificationsPanel = ({ notifications = [], onMarkRead }) => {
    const [isMarking, setIsMarking] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = async () => {
        setIsMarking(true);
        try {
            await authService.markNotificationsRead();
            toast.success('All notifications marked as read', { icon: '✅' });
            onMarkRead();
        } catch (error) {
            toast.error('Failed to mark as read');
        } finally {
            setIsMarking(false);
        }
    };

    const formatTimeAgo = (dateStr) => {
        const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <motion.div 
            className="notifications-panel-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="notifications-header">
                <div className="header-info">
                    <h2><Bell size={24} style={{ marginRight: '10px', color: 'var(--primary)' }}/> Notifications</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.</p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        className="mark-read-btn" 
                        onClick={handleMarkAllRead} 
                        disabled={isMarking}
                    >
                        {isMarking ? 'Marking...' : <><CheckSquare size={16} /> Mark all as read</>}
                    </button>
                )}
            </div>

            <div className="notifications-list">
                <AnimatePresence>
                    {notifications.length > 0 ? (
                        [...notifications].reverse().map((notif, index) => (
                            <motion.div 
                                key={notif._id || index}
                                className={`notification-card ${!notif.isRead ? 'unread' : 'read'}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="notif-icon-wrapper">
                                    <Zap size={20} className={!notif.isRead ? 'pulse-icon' : ''} />
                                </div>
                                <div className="notif-content">
                                    <div className="notif-top">
                                        <h4>{notif.title}</h4>
                                        <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                                    </div>
                                    <p>{notif.message}</p>
                                </div>
                                {!notif.isRead && <div className="unread-dot"></div>}
                            </motion.div>
                        ))
                    ) : (
                        <div className="empty-notifications">
                            <Info size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                            <h3>All caught up!</h3>
                            <p>You have no new notifications right now.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default NotificationsPanel;
