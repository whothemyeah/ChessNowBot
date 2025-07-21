import { prisma } from '@/lib/prisma';

// Game mode interface
export interface GameMode {
    id: string;
    name: string;
    timerEnabled: boolean;
    timerInit: number;
    timerIncrement: number;
    description?: string;
}

// Predefined game modes
export const GAME_MODES: GameMode[] = [
    {
        id: 'bullet',
        name: 'Bullet',
        timerEnabled: true,
        timerInit: 60, // 1 minute
        timerIncrement: 0,
        description: 'Fast-paced game with 1 minute per player'
    },
    {
        id: 'blitz',
        name: 'Blitz',
        timerEnabled: true,
        timerInit: 180, // 3 minutes
        timerIncrement: 2,
        description: 'Quick game with 3 minutes per player and 2 second increment'
    },
    {
        id: 'rapid',
        name: 'Rapid',
        timerEnabled: true,
        timerInit: 600, // 10 minutes
        timerIncrement: 5,
        description: 'Standard game with 10 minutes per player and 5 second increment'
    },
    {
        id: 'classical',
        name: 'Classical',
        timerEnabled: true,
        timerInit: 1800, // 30 minutes
        timerIncrement: 10,
        description: 'Traditional game with 30 minutes per player and 10 second increment'
    },
    {
        id: 'custom',
        name: 'Custom',
        timerEnabled: false,
        timerInit: 0,
        timerIncrement: 0,
        description: 'Custom game with no timer'
    }
];

export class GameService {
    /**
     * Get all game modes
     */
    async getGameModes(): Promise<GameMode[]> {
        return GAME_MODES;
    }

    /**
     * Get a game mode by ID
     */
    async getGameModeById(id: string): Promise<GameMode | null> {
        return GAME_MODES.find(mode => mode.id === id) || null;
    }

    /**
     * Get all games for a user
     */
    async getUserGames(userId: number) {
        return prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: userId },
                    { blackPlayerID: userId }
                ]
            },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                },
                blackPlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get active games for a user
     */
    async getActiveUserGames(userId: number) {
        return prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: userId },
                    { blackPlayerID: userId }
                ],
                resolution: 'in-progress'
            },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                },
                blackPlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                }
            }
        });
    }

    /**
     * Get completed games for a user
     */
    async getCompletedUserGames(userId: number) {
        return prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: userId },
                    { blackPlayerID: userId }
                ],
                NOT: {
                    resolution: 'in-progress'
                }
            },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                },
                blackPlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get a game by ID
     */
    async getGameById(gameId: string) {
        return prisma.playedGame.findUnique({
            where: { id: gameId },
            include: {
                whitePlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                },
                blackPlayer: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarURL: true
                    }
                }
            }
        });
    }

    /**
     * Create a new game
     */
    async createGame(gameData: {
        id: string;
        whitePlayerID: number;
        blackPlayerID: number;
        timerEnabled: boolean;
        timerInit: number;
        timerIncrement: number;
        gameMode?: string;
    }) {
        return prisma.playedGame.create({
            data: {
                id: gameData.id,
                whitePlayerID: gameData.whitePlayerID,
                blackPlayerID: gameData.blackPlayerID,
                timerEnabled: gameData.timerEnabled,
                timerInit: gameData.timerInit,
                timerIncrement: gameData.timerIncrement,
                pgn: '',
                resolution: 'in-progress',
                gameMode: gameData.gameMode
            },
            include: {
                whitePlayer: true,
                blackPlayer: true
            }
        });
    }

    /**
     * Update a game
     */
    async updateGame(gameId: string, gameData: {
        pgn?: string;
        resolution?: string;
        winner?: string | null;
    }) {
        return prisma.playedGame.update({
            where: { id: gameId },
            data: gameData,
            include: {
                whitePlayer: true,
                blackPlayer: true
            }
        });
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: number) {
        const games = await prisma.playedGame.findMany({
            where: {
                OR: [
                    { whitePlayerID: userId },
                    { blackPlayerID: userId }
                ],
                NOT: {
                    resolution: 'in-progress'
                }
            }
        });

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
            draws
        };
    }
}

export const gameService = new GameService();