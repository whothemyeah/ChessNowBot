import { GameRules } from './DataModel';

/**
 * Interface for a game mode
 */
export interface GameMode {
  title: string;
  description?: string;
  gameRules: GameRules;
}

/**
 * Predefined game modes
 */
export const gameModes: Record<string, GameMode> = {
  bullet: {
    title: "Bullet (1|0)",
    description: "Fast-paced game with 1 minute per player and no increment",
    gameRules: {
      timer: true,
      initialTime: 60, // 1 minute in seconds
      timerIncrement: 0,
    },
  },
  blitz: {
    title: "Blitz (3|2)",
    description: "Quick game with 3 minutes per player and 2 second increment",
    gameRules: {
      timer: true,
      initialTime: 180, // 3 minutes in seconds
      timerIncrement: 2,
    },
  },
  rapid: {
    title: "Rapid (10|5)",
    description: "Moderate pace game with 10 minutes per player and 5 second increment",
    gameRules: {
      timer: true,
      initialTime: 600, // 10 minutes in seconds
      timerIncrement: 5,
    },
  },
  classical: {
    title: "Classical (30|20)",
    description: "Traditional chess with 30 minutes per player and 20 second increment",
    gameRules: {
      timer: true,
      initialTime: 1800, // 30 minutes in seconds
      timerIncrement: 20,
    },
  },
};

/**
 * Get a game mode by its key
 * @param key The key of the game mode
 * @returns The game mode or undefined if not found
 */
export function getGameMode(key: string): GameMode | undefined {
  return gameModes[key];
}

/**
 * Get all game modes
 * @returns All game modes
 */
export function getAllGameModes(): Record<string, GameMode> {
  return gameModes;
}