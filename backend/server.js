const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());

// TODO: Replace with real database/Firebase integration
// TODO: Add JWT token generation after authentication
const MOCK_USER = {
    email: 'student@test.com',
    password: '12345678'
};

// POST /api/auth/login/student
app.post('/api/auth/login/student', (req, res) => {
    console.log('Login request received:', {
        body: req.body,
        timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        console.log('Login failed: Missing email or password');
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // TODO: Replace with real database query
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
        console.log('Login successful for:', email);
        return res.json({
            success: true,
            message: 'Login successful',
            role: 'student',
            token: 'mock-jwt-token'
        });
    }

    console.log('Login failed: Invalid credentials for:', email);
    return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
});

// GET /api/auth/role
app.get('/api/auth/role', (req, res) => {
    console.log('Role lookup request received:', {
        query: req.query,
        timestamp: new Date().toISOString()
    });

    const email = req.query.email;

    // Validate email
    if (!email) {
        console.log('Role lookup failed: Email is required');
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    // TODO: Replace with real database role lookup
    const mockUsers = {
        'student@test.com': { role: 'student', name: 'Student User' },
        'admin@campus.edu': { role: 'admin', name: 'Admin User' }
    };

    const user = mockUsers[email];
    if (user) {
        console.log('Role lookup successful for:', email);
        return res.json({
            success: true,
            role: user.role,
            name: user.name,
            email: email
        });
    }

    console.log('Role lookup failed: User not found for:', email);
    return res.status(404).json({
        success: false,
        message: 'User role not found'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`CORS enabled for http://localhost:3000`);
});