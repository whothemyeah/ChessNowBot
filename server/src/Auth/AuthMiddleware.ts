import { Request, Response, NextFunction } from 'express';
import { authController, AuthError } from '@/Auth/AuthController';
import { UserProfile } from '@/GameServer/Database';

/**
 * Express middleware to authenticate requests
 */
export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const payload = authController.verifyToken(token);

        // Get user from database
        const user = await UserProfile.findByPk(payload.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(401).json({ error: error.message });
        }
        next(error);
    }
};

// Socket.io authentication is now handled directly in the GameServer.handleConnection method

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: UserProfile;
        }
    }
}