import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
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

/**
 * Socket.io middleware to authenticate socket connections
 */
export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new AuthError('Authentication token required'));
        }

        const payload = authController.verifyToken(token);
        
        // Store user ID in socket for later use
        socket.data.userId = payload.userId;
        next();
    } catch (error) {
        next(error instanceof AuthError ? error : new Error('Authentication failed'));
    }
};

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: UserProfile;
        }
    }
}