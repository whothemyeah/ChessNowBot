import express from 'express';
import { authenticateRequest } from '@/Auth/AuthMiddleware';
import { gameService } from '@/GameServer/GameService';

const router = express.Router();

// Get all game modes
router.get('/modes', async (req, res) => {
    try {
        const modes = await gameService.getGameModes();
        res.json(modes);
    } catch (error) {
        console.error('Error fetching game modes:', error);
        res.status(500).json({ error: 'Failed to fetch game modes' });
    }
});

// Get a specific game mode
router.get('/modes/:id', async (req, res) => {
    try {
        const mode = await gameService.getGameModeById(req.params.id);
        if (!mode) {
            return res.status(404).json({ error: 'Game mode not found' });
        }
        res.json(mode);
    } catch (error) {
        console.error('Error fetching game mode:', error);
        res.status(500).json({ error: 'Failed to fetch game mode' });
    }
});

// Protected routes below - require authentication
router.use(authenticateRequest);

// Get all games for the authenticated user
router.get('/user/games', async (req, res) => {
    try {
        const games = await gameService.getUserGames(req.user!.id);
        res.json(games);
    } catch (error) {
        console.error('Error fetching user games:', error);
        res.status(500).json({ error: 'Failed to fetch user games' });
    }
});

// Get active games for the authenticated user
router.get('/user/games/active', async (req, res) => {
    try {
        const games = await gameService.getActiveUserGames(req.user!.id);
        res.json(games);
    } catch (error) {
        console.error('Error fetching active games:', error);
        res.status(500).json({ error: 'Failed to fetch active games' });
    }
});

// Get completed games for the authenticated user
router.get('/user/games/completed', async (req, res) => {
    try {
        const games = await gameService.getCompletedUserGames(req.user!.id);
        res.json(games);
    } catch (error) {
        console.error('Error fetching completed games:', error);
        res.status(500).json({ error: 'Failed to fetch completed games' });
    }
});

// Get a specific game
router.get('/:id', async (req, res) => {
    try {
        const game = await gameService.getGameById(req.params.id);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
});

// Get user statistics
router.get('/user/stats', async (req, res) => {
    try {
        const stats = await gameService.getUserStats(req.user!.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

export default router;