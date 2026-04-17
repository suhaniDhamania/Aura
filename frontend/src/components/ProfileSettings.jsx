import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../api/authService';
import './ProfileSettings.css';

const ProfileSettings = ({ user, profileData, onProfileUpdated }) => {
    const [seed, setSeed] = useState(user?.username || 'admin');
    const [formData, setFormData] = useState({
        username: user?.username || '',
        bio: profileData?.bio || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profileData) {
            setFormData({
                username: profileData.username || '',
                bio: profileData.bio || ''
            });
            // Extract seed from existing avatar if it's a dicebear url
            if (profileData.avatar && profileData.avatar.includes('dicebear')) {
                const url = new URL(profileData.avatar);
                const currentSeed = url.searchParams.get('seed');
                if (currentSeed) setSeed(currentSeed);
            }
        }
    }, [profileData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setSeed(randomSeed);
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Saving profile...');
        try {
            const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
            
            const payload = {
                username: formData.username,
                bio: formData.bio,
                avatar: avatarUrl
            };

            const data = await authService.updateProfile(payload);
            toast.success('Profile updated successfully', { id: toastId });
            
            // Sync local storage so username change reflects
            const userObj = JSON.parse(localStorage.getItem('user'));
            userObj.username = data.user.username;
            userObj.avatar = data.user.avatar;
            localStorage.setItem('user', JSON.stringify(userObj));

            onProfileUpdated();
        } catch (error) {
            toast.error(error.message || 'Error saving profile', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            className="profile-settings-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="profile-header-card">
                <div className="avatar-preview-section">
                    <div className="avatar-preview-wrapper" style={{background: 'var(--card-border)', padding: '10px', borderRadius: '50%', display: 'inline-block', position: 'relative'}}>
                        <img 
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`} 
                            alt="avatar preview" 
                            style={{width: '120px', height: '120px', borderRadius: '50%'}} 
                        />
                        <button type="button" className="randomize-btn" onClick={handleRandomizeAvatar} title="Generate new avatar">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                    <div className="avatar-info">
                        <h2>Avatar Generator</h2>
                        <p style={{color: 'var(--text-secondary)'}}>Roll the dice to get a premium glassmorphic avatar using DiceBear. Set it to your profile instantly.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSaveChanges} className="profile-form-card">
                <h3>Personal Information</h3>
                
                <div className="form-group-flex">
                    <div className="form-group" style={{flex: 1}}>
                        <label>Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            className="glass-input"
                            required
                        />
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                        <label>Email (Read-only)</label>
                        <input 
                            type="email" 
                            value={user?.email || ''} 
                            className="glass-input"
                            disabled
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Bio</label>
                    <textarea 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleChange} 
                        className="glass-input"
                        placeholder="Tell us a little bit about yourself..."
                        rows="4"
                    />
                </div>

                <button type="submit" className="save-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
            </form>
        </motion.div>
    );
};

export default ProfileSettings;
