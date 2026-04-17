import axios from 'axios';
import { API_BASE_URL } from './config';

const authService = {
    signup: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },
    
    // Future endpoints can be added here
    login: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    verifyOTP: async (email, otp) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    resetPassword: async (email, otp, newPassword) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, { email, otp, newPassword });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    updateUserTheme: async (themeConfig) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/auth/update-theme`, 
                { themeConfig },
                { headers: { 'x-auth-token': token } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },
    
    getProfile: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/auth/me`,
                { headers: { 'x-auth-token': token } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    updateProfile: async (profileData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/auth/profile`,
                profileData,
                { headers: { 'x-auth-token': token } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    }
};

export default authService;
