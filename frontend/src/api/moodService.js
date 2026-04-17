import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const moodService = {
    logMood: async (moodData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/mood`,
                moodData,
                { headers: { 'x-auth-token': token } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    getMoodHistory: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/mood`,
                { headers: { 'x-auth-token': token } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    getMoodConfig: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/mood/config`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Network error or server down' };
        }
    },

    predictMood: async (text) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/mood/predict`,
                { text },
                { headers: { 'x-auth-token': token } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'AI prediction failed' };
        }
    }
};

export default moodService;
