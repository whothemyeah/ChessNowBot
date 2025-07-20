import express from 'express';
import { authenticateRequest } from '@/Auth/AuthMiddleware';
import { PlayedGame } from '@/GameServer/Database';
import { GameStatus, GameResolution } from '@/GameServer/DataModel';
import { Op } from 'sequelize';
import { getAllGameModes } from '@/GameServer/GameModes';
import { getDisconnectTimeoutSeconds } from '@/GameServer/ServerRoom';

const router = express.Router();

/**
 * @route GET /api/games
 * @desc Get user's games (ongoing and ended)
 * @access Private
 */
router.get('/', authenticateRequest, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Fetch games where the user is either white or black player
    const games = await PlayedGame.findAll({
      where: {
        [Op.or]: [
          { whitePlayerID: userId },
          { blackPlayerID: userId }
        ]
      },
      include: [
        { association: 'whitePlayer', attributes: ['id', 'fullName', 'username', 'avatarURL'] },
        { association: 'blackPlayer', attributes: ['id', 'fullName', 'username', 'avatarURL'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform the games into the format expected by the client
    const transformedGames = games.map(game => {
      const plainGame = game.get({ plain: true });
      const isWhitePlayer = plainGame.whitePlayerID === userId;
      const opponent = isWhitePlayer ? plainGame.blackPlayer : plainGame.whitePlayer;
      
      // Determine if the game is ongoing or ended
      let status = GameStatus.InProgress;
      if (plainGame.resolution) {
        status = GameStatus.Finished;
      }
      
      // Determine if the user won the game
      let isWinner = false;
      if (status === GameStatus.Finished) {
        if (plainGame.winner) {
          isWinner = (plainGame.winner === 'w' && isWhitePlayer) || 
                     (plainGame.winner === 'b' && !isWhitePlayer);
        }
      }

      return {
        id: plainGame.id,
        status,
        opponent: {
          id: opponent.id,
          fullName: opponent.fullName,
          username: opponent.username,
          avatarURL: opponent.avatarURL
        },
        createdTimestamp: Math.floor(new Date(plainGame.createdAt).getTime() / 1000),
        lastMoveTimestamp: Math.floor(new Date(plainGame.updatedAt || plainGame.createdAt).getTime() / 1000),
        resolution: plainGame.resolution,
        isWinner,
        gameMode: plainGame.gameMode || 'custom',
        timerEnabled: plainGame.timerEnabled,
        timerInit: plainGame.timerInit,
        timerIncrement: plainGame.timerIncrement
      };
    });

    res.json({ games: transformedGames });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

/**
 * @route GET /api/games/config
 * @desc Get game configuration settings
 * @access Public
 */
router.get('/config', (req, res) => {
  try {
    const disconnectTimeout = getDisconnectTimeoutSeconds();
    res.json({ 
      disconnectTimeout,
      gameModes: getAllGameModes()
    });
  } catch (error) {
    console.error('Error fetching game config:', error);
    res.status(500).json({ error: 'Failed to fetch game configuration' });
  }
});

/**
 * @route GET /api/games/:id
 * @desc Get a specific game by ID
 * @access Private
 */
router.get('/:id', authenticateRequest, async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = req.user!.id;

    // Fetch the game
    const game = await PlayedGame.findOne({
      where: {
        id: gameId,
        [Op.or]: [
          { whitePlayerID: userId },
          { blackPlayerID: userId }
        ]
      },
      include: [
        { association: 'whitePlayer', attributes: ['id', 'fullName', 'username', 'avatarURL'] },
        { association: 'blackPlayer', attributes: ['id', 'fullName', 'username', 'avatarURL'] }
      ]
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const plainGame = game.get({ plain: true });
    const isWhitePlayer = plainGame.whitePlayerID === userId;
    
    // Determine if the game is ongoing or ended
    let status = GameStatus.InProgress;
    if (plainGame.resolution) {
      status = GameStatus.Finished;
    }
    
    // Determine if the user won the game
    let isWinner = false;
    if (status === GameStatus.Finished) {
      if (plainGame.winner) {
        isWinner = (plainGame.winner === 'w' && isWhitePlayer) || 
                   (plainGame.winner === 'b' && !isWhitePlayer);
      }
    }

    const gameData = {
      id: plainGame.id,
      status,
      pgn: plainGame.pgn,
      whitePlayer: plainGame.whitePlayer,
      blackPlayer: plainGame.blackPlayer,
      createdTimestamp: Math.floor(new Date(plainGame.createdAt).getTime() / 1000),
      resolution: plainGame.resolution,
      winner: plainGame.winner,
      isWinner,
      gameMode: plainGame.gameMode || 'custom',
      timerEnabled: plainGame.timerEnabled,
      timerInit: plainGame.timerInit,
      timerIncrement: plainGame.timerIncrement
    };

    res.json({ game: gameData });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

export default router;