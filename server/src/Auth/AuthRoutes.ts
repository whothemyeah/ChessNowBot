import express from 'express';
import { authController, RegisterUserData, LoginUserData, AuthError, UserExistsError, InvalidCredentialsError } from '@/Auth/AuthController';
import { authenticateRequest } from '@/Auth/AuthMiddleware';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
    try {
        const userData: RegisterUserData = {
            email: req.body.email,
            password: req.body.password,
            fullName: req.body.fullName,
            username: req.body.username,
        };

        const { user, token } = await authController.register(userData);

        // Return user data without password
        const { password, ...userWithoutPassword } = user.get({ plain: true });
        
        res.status(201).json({
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        if (error instanceof UserExistsError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', async (req, res) => {
    try {
        const loginData: LoginUserData = {
            email: req.body.email,
            password: req.body.password,
        };

        const { user, token } = await authController.login(loginData);

        // Return user data without password
        const { password, ...userWithoutPassword } = user.get({ plain: true });
        
        res.json({
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return res.status(401).json({ error: error.message });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticateRequest, (req, res) => {
    // User is attached to request by authenticateRequest middleware
    const { password, ...userWithoutPassword } = req.user!.get({ plain: true });
    res.json(userWithoutPassword);
});

export default router;