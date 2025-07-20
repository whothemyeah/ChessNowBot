import { GameSummary } from '@/components/dashboard/GamesList';
import { GameStatus, GameResolution } from '@/lib/game-client/DataModel';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export async function fetchUserGames(token: string): Promise<{ ongoing: GameSummary[], ended: GameSummary[] }> {
  try {
    const response = await fetch(`${API_URL}/api/games`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }

    const data = await response.json();
    
    // Sort and filter games
    const ongoing = data.games
      .filter((game: any) => game.status === GameStatus.InProgress || game.status === GameStatus.NotStarted)
      .sort((a: any, b: any) => b.lastMoveTimestamp - a.lastMoveTimestamp);
    
    const ended = data.games
      .filter((game: any) => game.status === GameStatus.Finished)
      .sort((a: any, b: any) => b.createdTimestamp - a.createdTimestamp);
    
    return { ongoing, ended };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { ongoing: [], ended: [] };
  }
}

export async function fetchGameModes(): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${API_URL}/api/game-modes`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch game modes');
    }
    
    const data = await response.json();
    return data.gameModes || {};
  } catch (error) {
    console.error('Error fetching game modes:', error);
    
    // Return default game modes if API fails
    return {
      bullet: {
        title: "Bullet (1|0)",
        gameRules: {
          timer: true,
          initialTime: 60,
          timerIncrement: 0,
        },
      },
      blitz: {
        title: "Blitz (3|2)",
        gameRules: {
          timer: true,
          initialTime: 180,
          timerIncrement: 2,
        },
      },
      rapid: {
        title: "Rapid (10|5)",
        gameRules: {
          timer: true,
          initialTime: 600,
          timerIncrement: 5,
        },
      },
    };
  }
}