import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import './SettingsPanel.css';

const SettingsPanel = ({ user }) => {
    const navigate = useNavigate();
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("New passwords don't match");
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters");
        }

        setIsChangingPassword(true);
        const toastId = toast.loading('Updating password...');

        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            
            toast.success("Password changed securely", { id: toastId });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message || 'Error changing password', { id: toastId });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmStr = prompt(`To confirm deletion, type: ${user?.username}`);
        if (confirmStr !== user?.username) {
            return toast.error('Account deletion cancelled - username did not match');
        }

        setIsDeleting(true);
        const toastId = toast.loading('Deleting account permanently...');

        try {
            await authService.deleteAccount();
            toast.success("Account deleted", { id: toastId });
            
            // Log user out
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            toast.error(error.message || 'Failed to delete account', { id: toastId });
            setIsDeleting(false);
        }
    };

    return (
        <motion.div 
            className="settings-panel-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="settings-header">
                <h2>Account Settings</h2>
                <p>Manage your security preferences and personal data</p>
            </div>

            <div className="settings-card security-section">
                <div className="card-header">
                    <Lock size={20} className="header-icon" />
                    <h3>Change Password</h3>
                </div>
                
                <form onSubmit={submitPasswordChange} className="settings-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <input 
                            type="password" 
                            name="currentPassword" 
                            value={passwordForm.currentPassword} 
                            onChange={handlePasswordChange} 
                            className="glass-input"
                            required
                        />
                    </div>
                    <div className="form-group-flex">
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                name="newPassword" 
                                value={passwordForm.newPassword} 
                                onChange={handlePasswordChange} 
                                className="glass-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                value={passwordForm.confirmPassword} 
                                onChange={handlePasswordChange} 
                                className="glass-input"
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="save-btn" disabled={isChangingPassword}>
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            <div className="settings-card danger-zone">
                <div className="card-header danger">
                    <ShieldAlert size={20} className="header-icon danger-icon" />
                    <h3 className="danger-text">Danger Zone</h3>
                </div>
                
                <div className="danger-content">
                    <div className="danger-info">
                        <h4>Delete Account</h4>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    
                    <button 
                        className="delete-btn" 
                        onClick={handleDeleteAccount} 
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : <><Trash2 size={18} /> Delete Account</>}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default SettingsPanel;
