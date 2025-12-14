import axios from "axios";
import express from "express";

const router = express.Router();
// Middleware to check if user is authenticated via session
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    res.status(403).render('error', {
        message: 'Access Denied',
        error: { status: 403, stack: 'Admin privileges required' }
    });
};

// Middleware to attach user info to all views
router.use((req, res, next) => {
    res.locals.user = req.session.userId ? {
        id: req.session.userId,
        email: req.session.email,
        role: req.session.role
    } : null;
    next();
});

// ==================== PUBLIC ROUTES ====================

// Home Page - Display sample weather data
router.get('/', async (req, res) => {
    try {
        // Sample weather data for demonstration
        const sampleWeather = {
            location: {
                city: 'New York',
                country: 'USA',
                latitude: 40.7128,
                longitude: -74.0060,
                timezone: 'America/New_York',
                elevation: 10
            },
            current: {
                time: new Date().toISOString(),
                temperature: 22,
                windSpeed: 12
            },
            hourly: [
                { time: '2024-12-14T00:00', temperature: 20, humidity: 65, windSpeed: 10 },
                { time: '2024-12-14T01:00', temperature: 19, humidity: 68, windSpeed: 11 },
                { time: '2024-12-14T02:00', temperature: 18, humidity: 70, windSpeed: 9 },
                { time: '2024-12-14T03:00', temperature: 17, humidity: 72, windSpeed: 8 }
            ]
        };

        res.render('index', {
            weather: sampleWeather,
            isDemo: true
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('index', {
            weather: null,
            isDemo: true,
            error: 'Unable to load sample data'
        });
    }
});

// Login Page
router.get('/login', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

// Register Page
router.get('/register', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null });
});

// Handle Login Form Submission
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Call backend API for authentication
        const response = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/auth/login`, {
            email,
            password
        });

        if (response.data && response.data.token) {
            // Token format: userId:secretToken
            const [userId, token] = response.data.token.split(':');

            // Store in session
            req.session.userId = userId;
            req.session.email = email;
            req.session.jwtToken = response.data.token;

            // Fetch user role
            try {
                const userResponse = await axios.get(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/user/profile`, {
                    headers: { 'Authorization': `Bearer ${response.data.token}` }
                });
                req.session.role = userResponse.data.role || 'user';
            } catch (err) {
                req.session.role = 'user';
            }

            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            error: error.response?.data?.message || 'Login failed. Please try again.'
        });
    }
});

// Handle Register Form Submission
router.post('/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('register', { error: 'Passwords do not match' });
        }

        // Call backend API for registration
        const response = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/auth/register`, {
            email,
            password
        });

        if (response.data) {
            res.redirect('/login?registered=true');
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', {
            error: error.response?.data?.message || 'Registration failed. Please try again.'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// ==================== PROTECTED ROUTES ====================

// Dashboard - User can manage API keys
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        // Fetch user's API keys
        const response = await axios.get(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/user/keys`, {
            headers: { 'Authorization': `Bearer ${req.session.jwtToken}` }
        });

        res.render('dashboard', {
            apiKeys: response.data.keys || [],
            error: null,
            success: req.query.success
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('dashboard', {
            apiKeys: [],
            error: 'Unable to load API keys',
            success: null
        });
    }
});

// Generate New API Key
router.post('/dashboard/generate-key', isAuthenticated, async (req, res) => {
    try {
        const response = await axios.post(
            `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/generate`,
            {},
            { headers: { 'Authorization': `Bearer ${req.session.jwtToken}` } }
        );

        res.redirect('/dashboard?success=key_generated');
    } catch (error) {
        console.error('Key generation error:', error);
        res.redirect('/dashboard?error=key_generation_failed');
    }
});

// Delete API Key
router.post('/dashboard/delete-key/:keyId', isAuthenticated, async (req, res) => {
    try {
        await axios.delete(
            `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/keys/${req.params.keyId}`,
            { headers: { 'Authorization': `Bearer ${req.session.jwtToken}` } }
        );

        res.redirect('/dashboard?success=key_deleted');
    } catch (error) {
        console.error('Key deletion error:', error);
        res.redirect('/dashboard?error=key_deletion_failed');
    }
});

// Weather Query Page (with user's API key)
router.get('/weather', isAuthenticated, (req, res) => {
    res.render('weather', { weather: null, error: null });
});

// Handle Weather Query
router.post('/weather/query', isAuthenticated, async (req, res) => {
    try {
        const { apiKey, queryType, city, country, lat, lon } = req.body;

        let queryParams = {};
        if (queryType === 'coordinates') {
            queryParams = { lat, lon };
        } else {
            queryParams = { city, country };
        }

        const response = await axios.get(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/weather`, {
            params: queryParams,
            headers: { 'X-API-Key': apiKey }
        });

        res.render('weather', {
            weather: response.data,
            error: null
        });
    } catch (error) {
        console.error('Weather query error:', error);
        res.render('weather', {
            weather: null,
            error: error.response?.data?.message || 'Weather query failed'
        });
    }
});

// ==================== ADMIN ROUTES ====================

// Admin Dashboard
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
    try {
        // Fetch all users and their statistics
        const response = await axios.get(
            `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/stats`,
            { headers: { 'Authorization': `Bearer ${req.session.jwtToken}` } }
        );

        res.render('admin', {
            users: response.data || [],
            error: null,
            success: req.query.success
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.render('admin', {
            users: [],
            error: 'Unable to load user statistics',
            success: null
        });
    }
});

// Grant Admin Privileges
router.post('/admin/make-admin/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await axios.post(
            `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/${req.params.userId}/make-admin`,
            {},
            { headers: { 'Authorization': `Bearer ${req.session.jwtToken}` } }
        );

        res.redirect('/admin?success=admin_granted');
    } catch (error) {
        console.error('Grant admin error:', error);
        res.redirect('/admin?error=admin_grant_failed');
    }
});

// View User Details
router.get('/admin/user/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const response = await axios.get(
            `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/user/${req.params.userId}`,
            { headers: { 'Authorization': `Bearer ${req.session.jwtToken}` } }
        );

        res.render('admin-user-detail', {
            userData: response.data,
            error: null
        });
    } catch (error) {
        console.error('User detail error:', error);
        res.render('admin-user-detail', {
            userData: null,
            error: 'Unable to load user details'
        });
    }
});

// Delete User (Admin only)
router.post('/admin/delete-user/:userId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        await axios.delete(
            `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/v1/admin/user/${req.params.userId}`,
            { headers: { 'Authorization': `Bearer ${req.session.jwtToken}` } }
        );

        res.redirect('/admin?success=user_deleted');
    } catch (error) {
        console.error('User deletion error:', error);
        res.redirect('/admin?error=user_deletion_failed');
    }
});

// ==================== ERROR HANDLING ====================

// 404 Handler
router.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page Not Found',
        error: { status: 404, stack: '' }
    });
});

export default router;