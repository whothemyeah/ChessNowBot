import express from 'express';
import { authenticateRequest } from '@/Auth/AuthMiddleware';
import { GameServer } from '@/GameServer/GameServer';
import { GameRules } from '@/GameServer/DataModel';

// Reference to the GameServer instance
let gameServerInstance: GameServer | null = null;

// Function to set the GameServer instance
export const setGameServerInstance = (instance: GameServer) => {
    gameServerInstance = instance;
};

const router = express.Router();

/**
 * @route POST /api/rooms
 * @desc Create a new game room
 * @access Private
 */
router.post('/', authenticateRequest, async (req, res) => {
    try {
        if (!gameServerInstance) {
            return res.status(500).json({ error: 'Game server not initialized' });
        }

        const { gameRules } = req.body;
        
        // Validate game rules
        if (!gameRules) {
            return res.status(400).json({ error: 'Game rules are required' });
        }

        // Create validated game rules object
        const validatedGameRules: GameRules = {
            hostPreferredColor: gameRules.hostPreferredColor,
            timer: !!gameRules.timer,
            initialTime: gameRules.timer ? Number(gameRules.initialTime) || 300 : undefined,
            timerIncrement: gameRules.timer ? Number(gameRules.timerIncrement) || 0 : undefined,
        };

        // Get user from request (set by authenticateRequest middleware)
        const user = req.user!.get({ plain: true });
        
        // Create a new room
        const room = gameServerInstance.createRoom(
            {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username || undefined,
                avatarURL: user.avatarURL || undefined,
            },
            validatedGameRules
        );

        // Return the room ID
        res.status(201).json({ roomId: room.id });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

export default router;