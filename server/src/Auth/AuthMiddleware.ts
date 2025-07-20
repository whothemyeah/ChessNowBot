import { Request, Response, NextFunction } from 'express';
import { authController, AuthError } from '@/Auth/PrismaAuthController';
import { prisma } from '@/lib/prisma';
import { UserProfile } from '@/generated/prisma';

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
        const user = await prisma.userProfile.findUnique({
            where: { id: payload.userId }
        });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request
        req.user = user as any;
        next();
    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(401).json({ error: error.message });
        }
        next(error);
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