const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            username,
            email,
            password: hashedPassword,
            activities: [{ text: 'Account created successfully', type: 'success' }],
            notifications: [{ title: 'Welcome to Aura!', message: 'Explore the dashboard and start personalizing your theme.', isRead: false }]
        });

        await user.save();

        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                themeConfig: user.themeConfig
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.activities.push({ text: 'Successful login', type: 'info' });
        // Keep array size manageable (last 50)
        if (user.activities.length > 50) user.activities.shift();
        await user.save();

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                themeConfig: user.themeConfig
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const { sendOTP } = require('../utils/mailService');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`Forgot password request for email: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Generated OTP: ${otp} for user: ${user.email}`);
        
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();
        console.log('User model updated with OTP and expiry');

        console.log('Attempting to send OTP email...');
        const emailSent = await sendOTP(email, otp);
        if (emailSent) {
            console.log('OTP email sent successfully');
            res.json({ message: 'OTP sent to your email' });
        } else {
            console.error('Failed to send OTP email');
            res.status(500).json({ message: 'Error sending email. Please check server logs.' });
        }
    } catch (err) {
        console.error('Caught error in forgotPassword controller:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email, 
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear OTP fields
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        
        user.activities.push({ text: 'Password was reset securely', type: 'warning' });
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTheme = async (req, res) => {
    try {
        const { themeConfig } = req.body;
        // User ID is attached to req by the auth middleware
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.themeConfig = themeConfig;
        user.activities.push({ text: 'Personalization settings updated', type: 'info' });
        await user.save();

        res.json({ message: 'Theme settings saved successfully', themeConfig: user.themeConfig });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, bio, avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;
        if (bio !== undefined) user.bio = bio;
        if (avatar) user.avatar = avatar;

        user.activities.push({ text: 'Profile information updated', type: 'success' });
        // Keep array size manageable
        if (user.activities.length > 50) user.activities.shift();
        
        await user.save();

        res.json({ 
            message: 'Profile updated successfully', 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                themeConfig: user.themeConfig
            } 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.markNotificationsRead = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.notifications.forEach(notif => notif.isRead = true);
        await user.save();

        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password cannot be the same as current password' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.activities.push({ text: 'Account password changed securely', type: 'warning' });
        
        // Add a security notification
        user.notifications.push({
            title: 'Security Alert',
            message: 'Your account password was recently changed. If this wasn\'t you, please contact support immediately.',
            isRead: false
        });

        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account permanently deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
