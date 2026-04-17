const axios = require('axios');

const testRoutes = async () => {
    try {
        console.log('Testing Signup...');
        try {
            await axios.post('http://localhost:5000/api/auth/signup', {});
        } catch (e) {
            console.log('Signup Response Status:', e.response?.status);
        }

        console.log('Testing Login...');
        try {
            await axios.post('http://localhost:5000/api/auth/login', {});
        } catch (e) {
            console.log('Login Response Status:', e.response?.status);
        }
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
};

testRoutes();
