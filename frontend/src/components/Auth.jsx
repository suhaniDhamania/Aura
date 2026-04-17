import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../api/authService';
import birdieAnimation from '../assets/birdie.json';
import './Auth.css';

const LottieComponent = Lottie.default || Lottie;

const Auth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token') && localStorage.getItem('user')) {
            navigate('/dashboard');
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [navigate]);

    const [isLogin, setIsLogin] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Pass
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        otp: '',
        newPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading(isLogin ? 'Signing in...' : 'Registering...');

        try {
            let data;
            if (isLogin) {
                data = await authService.login({ email: formData.email, password: formData.password });
                localStorage.setItem('token', data.token);
            } else {
                data = await authService.signup(formData);
            }
            toast.success(data.message, { id: toastId });
            
            // Store user data
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            if (isLogin) {
                navigate('/dashboard');
            } else {
                setFormData({ ...formData, username: '', email: '', password: '' });
                setIsLogin(true); // Switch to login after signup
            }
        } catch (err) {
            toast.error(err.message || 'Error occurred.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Processing...');

        try {
            let data;
            if (forgotStep === 1) {
                data = await authService.forgotPassword(formData.email);
                setForgotStep(2);
            } else if (forgotStep === 2) {
                data = await authService.verifyOTP(formData.email, formData.otp);
                setForgotStep(3);
            } else {
                data = await authService.resetPassword(formData.email, formData.otp, formData.newPassword);
                setShowForgot(false);
                setForgotStep(1);
                setIsLogin(true);
            }
            toast.success(data.message, { id: toastId });
        } catch (err) {
            toast.error(err.message || 'Error occurred.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: { opacity: 0, scale: 0.95 }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="auth-container">
            <motion.div 
                className={`auth-card ${isLogin && !showForgot ? 'right-panel-active' : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                
                <AnimatePresence mode="wait">
                    {showForgot ? (
                        <motion.div 
                            key="forgot-view"
                            className="form-container sign-up-container full-width"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ width: '100%', left: 0, zIndex: 100 }}
                        >
                            <form onSubmit={handleForgotSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
                                <motion.div className="form-header" variants={itemVariants}>
                                    <h2>Reset Password</h2>
                                    <p>
                                        {forgotStep === 1 && "Enter your email to receive an OTP"}
                                        {forgotStep === 2 && "Enter the 6-digit OTP sent to your email"}
                                        {forgotStep === 3 && "Now set your new password"}
                                    </p>
                                </motion.div>

                                {forgotStep === 1 && (
                                    <motion.div className="form-group" variants={itemVariants}>
                                        <label>Email Address</label>
                                        <div className="input-wrapper">
                                            <Mail size={18} />
                                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="email" />
                                        </div>
                                    </motion.div>
                                )}

                                {forgotStep === 2 && (
                                    <motion.div className="form-group" variants={itemVariants}>
                                        <label>One Time Password (OTP)</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} />
                                            <input type="text" name="otp" placeholder="6-digit OTP" value={formData.otp} onChange={handleChange} required maxLength="6" />
                                        </div>
                                    </motion.div>
                                )}

                                {forgotStep === 3 && (
                                    <motion.div className="form-group" variants={itemVariants}>
                                        <label>New Password</label>
                                        <div className="input-wrapper">
                                            <Lock size={18} />
                                            <input type="password" name="newPassword" placeholder="Minimum 6 characters" value={formData.newPassword} onChange={handleChange} required autoComplete="new-password" />
                                        </div>
                                    </motion.div>
                                )}

                                <motion.button 
                                    type="submit" 
                                    className="auth-button"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Loader2 size={18} />
                                        </motion.div>
                                    ) : (
                                        forgotStep === 1 ? 'Send OTP' : (forgotStep === 2 ? 'Verify OTP' : 'Update Password')
                                    )}
                                </motion.button>
                                
                                <motion.p 
                                    variants={itemVariants}
                                    onClick={() => { setShowForgot(false); setForgotStep(1); }}
                                    style={{ marginTop: '1.5rem', color: '#6366f1', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center', fontWeight: '500' }}
                                >
                                    Back to Login
                                </motion.p>
                            </form>
                        </motion.div>
                    ) : (
                        <>
                            {/* SIGN UP PANEL */}
                            <div className="form-container sign-up-container">
                                <AnimatePresence mode="wait">
                                    {!isLogin && (
                                        <motion.form 
                                            key="signup-form"
                                            onSubmit={handleFormSubmit}
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <motion.div className="form-header" variants={itemVariants}>
                                                <h2>Create Account</h2>
                                                <p>Get started with your free account</p>
                                            </motion.div>
                                            
                                            <motion.div className="form-group" variants={itemVariants}>
                                                <label>Username</label>
                                                <div className="input-wrapper">
                                                    <User size={18} />
                                                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required autoComplete="username" />
                                                </div>
                                            </motion.div>

                                            <motion.div className="form-group" variants={itemVariants}>
                                                <label>Email</label>
                                                <div className="input-wrapper">
                                                    <Mail size={18} />
                                                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="email" />
                                                </div>
                                            </motion.div>

                                            <motion.div className="form-group" variants={itemVariants}>
                                                <label>Password</label>
                                                <div className="input-wrapper">
                                                    <Lock size={18} />
                                                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
                                                </div>
                                            </motion.div>

                                            <motion.button 
                                                type="submit" 
                                                className="auth-button"
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <Loader2 size={18} />
                                                    </motion.div>
                                                ) : (
                                                    "Sign Up"
                                                )}
                                            </motion.button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* SIGN IN PANEL */}
                            <div className="form-container sign-in-container">
                                <AnimatePresence mode="wait">
                                    {isLogin && (
                                        <motion.form 
                                            key="login-form"
                                            onSubmit={handleFormSubmit}
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <motion.div className="form-header" variants={itemVariants}>
                                                <h2>Welcome Back</h2>
                                                <p>To keep connected with us please login</p>
                                            </motion.div>

                                            <motion.div className="form-group" variants={itemVariants}>
                                                <label>Email</label>
                                                <div className="input-wrapper">
                                                    <Mail size={18} />
                                                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="email" />
                                                </div>
                                            </motion.div>

                                            <motion.div className="form-group" variants={itemVariants}>
                                                <label>Password</label>
                                                <div className="input-wrapper">
                                                    <Lock size={18} />
                                                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="current-password" />
                                                </div>
                                            </motion.div>

                                            <motion.button 
                                                type="submit" 
                                                className="auth-button"
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <Loader2 size={18} />
                                                    </motion.div>
                                                ) : (
                                                    "Sign In"
                                                )}
                                            </motion.button>
                                            <motion.p 
                                                variants={itemVariants}
                                                onClick={() => setShowForgot(true)}
                                                style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >
                                                Forgot your password?
                                            </motion.p>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* OVERLAY PANEL */}
                            <div className="overlay-container">
                                <div className="overlay">
                                    <div className="overlay-panel overlay-left">
                                        <motion.div 
                                            className="mascot-container"
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                        >
                                            {birdieAnimation && <LottieComponent animationData={birdieAnimation} loop={true} style={{width: '100%', height: '100%'}}/>}
                                        </motion.div>
                                        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Welcome Friend!</h2>
                                        <p style={{ marginBottom: '2rem', fontSize: '1rem' }}>Enter your details and start journey with us</p>
                                        <button className="ghost-button" onClick={toggleMode}>Sign Up</button>
                                    </div>
                                    <div className="overlay-panel overlay-right">
                                        <motion.div 
                                            className="mascot-container"
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                        >
                                            {birdieAnimation && <LottieComponent animationData={birdieAnimation} loop={true} style={{width: '100%', height: '100%'}}/>}
                                        </motion.div>
                                        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Glad you're back!</h2>
                                        <p style={{ marginBottom: '2rem', fontSize: '1rem' }}>To keep connected with us please login with your personal info</p>
                                        <button className="ghost-button" onClick={toggleMode}>Sign In</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </AnimatePresence>

            </motion.div>
        </div>
    );
};

export default Auth;
