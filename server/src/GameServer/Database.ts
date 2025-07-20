import { prisma } from '@/lib/prisma';
import { Color, GameResolution } from '@/GameServer/DataModel.js';

// Export the prisma client for use in other modules
export { prisma };

// Type definitions for game-related operations
export interface CreateGameParams {
    id: string;
    timerEnabled: boolean;
    timerInit: number;
    timerIncrement: number;
    pgn: string;
    resolution: GameResolution;
    winner: Color | null;
    whitePlayerID: number;
    blackPlayerID: number;
    gameMode?: string;
}

export interface UpdateGameParams {
    id: string;
    pgn?: string;
    resolution?: GameResolution;
    winner?: Color | null;
}

// Game operations
export const GameOperations = {
    /**
     * Create a new game
     */
    createGame: async (params: CreateGameParams) => {
        return prisma.playedGame.create({
            data: {
                id: params.id,
                timerEnabled: params.timerEnabled,
                timerInit: params.timerInit,
                timerIncrement: params.timerIncrement,
                pgn: params.pgn,
                resolution: params.resolution,
                winner: params.winner,
                whitePlayerID: params.whitePlayerID,
                blackPlayerID: params.blackPlayerID,
                gameMode: params.gameMode,
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            },
        });
    },

    /**
     * Get a game by ID
     */
    getGameById: async (id: string) => {
        return prisma.playedGame.findUnique({
            where: { id },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            },
        });
    },

    /**
     * Update a game
     */
    updateGame: async (params: UpdateGameParams) => {
        const updateData: any = {};
        
        if (params.pgn !== undefined) updateData.pgn = params.pgn;
        if (params.resolution !== undefined) updateData.resolution = params.resolution;
        if (params.winner !== undefined) updateData.winner = params.winner;
        
        return prisma.playedGame.update({
            where: { id: params.id },
            data: updateData,
            include: {
                whitePlayer: true,
                blackPlayer: true,
            },
        });
    },

    /**
     * Get games by player ID
     */
    getGamesByPlayerId: async (playerId: number) => {
        return prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: playerId },
                    { blackPlayerID: playerId },
                ],
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    /**
     * Get active games by player ID
     */
    getActiveGamesByPlayerId: async (playerId: number) => {
        return prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: playerId },
                    { blackPlayerID: playerId },
                ],
                resolution: 'in-progress',
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            },
        });
    },
};

// User operations
export const UserOperations = {
    /**
     * Get a user by ID
     */
    getUserById: async (id: number) => {
        return prisma.userProfile.findUnique({
            where: { id },
        });
    },

    /**
     * Get a user by email
     */
    getUserByEmail: async (email: string) => {
        return prisma.userProfile.findUnique({
            where: { email },
        });
    },

    /**
     * Get a user by username
     */
    getUserByUsername: async (username: string) => {
        return prisma.userProfile.findUnique({
            where: { username },
        });
    },

    /**
     * Update a user
     */
    updateUser: async (id: number, data: any) => {
        return prisma.userProfile.update({
            where: { id },
            data,
        });
    },

    /**
     * Get user statistics
     */
    getUserStats: async (userId: number) => {
        // Get all games for the user
        const games = await prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: userId },
                    { blackPlayerID: userId },
                ],
                NOT: {
                    resolution: 'in-progress',
                },
            },
        });

        // Calculate statistics
        let wins = 0;
        let losses = 0;
        let draws = 0;

        games.forEach(game => {
            if (!game.winner) {
                // Draw
                draws++;
            } else if (
                (game.winner === 'white' && game.whitePlayerID === userId) ||
                (game.winner === 'black' && game.blackPlayerID === userId)
            ) {
                // Win
                wins++;
            } else {
                // Loss
                losses++;
            }
        });

        return {
            totalGames: games.length,
            wins,
            losses,
            draws,
        };
    },
};