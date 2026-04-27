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

const MOCK_ADMIN = {
    email: 'admin@campus.edu',
    password: '12345678',
    name: 'Admin User'
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

// POST /api/auth/login/admin
app.post('/api/auth/login/admin', (req, res) => {
    console.log('Admin login request received:', {
        body: req.body,
        timestamp: new Date().toISOString()
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        console.log('Admin login failed: Missing email or password');
        return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials'
        });
    }

    // TODO: Replace with real database query for admin authentication
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
        console.log('Admin login successful for:', email);
        return res.json({
            success: true,
            role: 'admin',
            name: MOCK_ADMIN.name,
            email: email,
            message: 'Admin login successful'
        });
    }

    console.log('Admin login failed: Invalid credentials for:', email);
    return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
    });
});

// POST /api/auth/register/student
app.post('/api/auth/register/student', (req, res) => {
    console.log('Student registration request received:', {
        body: req.body,
        timestamp: new Date().toISOString()
    });

    const { firstName, lastName, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        console.log('Registration failed: Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    // Validate password length (8-10 characters)
    if (password.length < 8 || password.length > 10) {
        console.log('Registration failed: Invalid password length');
        return res.status(400).json({
            success: false,
            message: 'Password must be 8 to 10 characters long'
        });
    }

    // TODO: Replace mock logic with real database/Firebase validation
    // Check if email already exists (mock validation)
    const registeredEmails = ['student@test.com', 'admin@campus.edu', 'john.doe@test.com'];
    if (registeredEmails.includes(email.toLowerCase())) {
        console.log('Registration failed: Email already exists:', email);
        return res.status(400).json({
            success: false,
            message: 'Email already exists'
        });
    }

    // Store user in mock database
    console.log('Registration successful for:', email);
    return res.json({
        success: true,
        message: 'Registration successful',
        role: 'student'
    });
});

// POST /api/auth/google
app.post('/api/auth/google', (req, res) => {
    console.log('Google authentication request received:', {
        body: req.body,
        timestamp: new Date().toISOString()
    });

    const { name, email, provider } = req.body;

    // Validate required fields
    if (!name || !email || !provider) {
        console.log('Google auth failed: Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'Name, email, and provider are required'
        });
    }

    // TODO: Replace with Firebase/Google OAuth token verification
    // In production, verify the Google ID token here using Firebase Admin SDK
    // or Google OAuth2 API to ensure the token is valid and not tampered

    console.log('Google authentication successful for:', email);
    return res.json({
        success: true,
        role: 'student',
        name: name,
        email: email
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