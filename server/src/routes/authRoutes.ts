import express from 'express';
import { authController, InvalidCredentialsError, UserExistsError } from '@/Auth/AuthController';
import { authenticateRequest } from '@/Auth/AuthMiddleware';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, username } = req.body;
        
        // Validate input
        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required' });
        }
        
        const result = await authController.register({ email, password, fullName, username });
        
        // Return user data without password
        const { password: _, ...userData } = result.user;
        
        res.status(201).json({
            user: userData,
            token: result.token
        });
    } catch (error) {
        if (error instanceof UserExistsError) {
            return res.status(409).json({ error: error.message });
        }
        
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const result = await authController.login({ email, password });
        
        // Return user data without password
        const { password: _, ...userData } = result.user;
        
        res.json({
            user: userData,
            token: result.token
        });
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return res.status(401).json({ error: error.message });
        }
        
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile (requires authentication)
router.get('/me', authenticateRequest, (req, res) => {
    // User is already attached to req by the authenticateRequest middleware
    const { password: _, ...userData } = req.user!;
    res.json(userData);
});

export default router;