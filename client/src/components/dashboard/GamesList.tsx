'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import { GameStatus, GameResolution } from '@/lib/game-client/DataModel';

export interface GameSummary {
  id: string;
  opponent: {
    fullName: string;
    username?: string;
  };
  status: GameStatus;
  createdTimestamp: number;
  lastMoveTimestamp?: number;
  resolution?: GameResolution;
  isWinner?: boolean;
  gameMode?: string;
}

interface GamesListProps {
  ongoingGames: GameSummary[];
  endedGames: GameSummary[];
}

const GamesList: React.FC<GamesListProps> = ({ ongoingGames, endedGames }) => {
  const router = useRouter();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusChip = (game: GameSummary) => {
    if (game.status === GameStatus.InProgress) {
      return <Chip label="In Progress" color="primary" size="small" />;
    } else if (game.status === GameStatus.Finished) {
      if (game.isWinner) {
        return <Chip label="Won" color="success" size="small" />;
      } else if (game.resolution === GameResolution.Draw || game.resolution === GameResolution.Stalemate) {
        return <Chip label="Draw" color="warning" size="small" />;
      } else {
        return <Chip label="Lost" color="error" size="small" />;
      }
    } else {
      return <Chip label="Not Started" color="default" size="small" />;
    }
  };

  const getResolutionText = (resolution?: GameResolution) => {
    switch (resolution) {
      case GameResolution.Checkmate:
        return 'Checkmate';
      case GameResolution.OutOfTime:
        return 'Time Out';
      case GameResolution.PlayerQuit:
        return 'Player Quit';
      case GameResolution.GiveUp:
        return 'Resignation';
      case GameResolution.Stalemate:
        return 'Stalemate';
      case GameResolution.Draw:
        return 'Draw';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Your Games</Typography>
      
      {ongoingGames.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Ongoing Games</Typography>
          <Grid container spacing={2}>
            {ongoingGames.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game.id}>
                <Card variant="outlined" sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="div">
                        vs. {game.opponent.fullName}
                      </Typography>
                      {getStatusChip(game)}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {game.gameMode || 'Custom Game'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Started: {formatDate(game.createdTimestamp)}
                    </Typography>
                    
                    {game.lastMoveTimestamp && (
                      <Typography variant="body2" color="text.secondary">
                        Last move: {formatDate(game.lastMoveTimestamp)}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => router.push(`/game/${game.id}`)}
                      >
                        Continue Game
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {endedGames.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Completed Games</Typography>
          <Grid container spacing={2}>
            {endedGames.map((game) => (
              <Grid item xs={12} sm={6} md={4} key={game.id}>
                <Card variant="outlined" sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderLeft: game.isWinner 
                    ? '4px solid #4caf50' 
                    : game.resolution === GameResolution.Draw || game.resolution === GameResolution.Stalemate
                      ? '4px solid #ff9800'
                      : '4px solid #f44336'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" component="div">
                        vs. {game.opponent.fullName}
                      </Typography>
                      {getStatusChip(game)}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {game.gameMode || 'Custom Game'}
                    </Typography>
                    
                    {game.resolution && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Result: {getResolutionText(game.resolution)}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                      Played: {formatDate(game.createdTimestamp)}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => router.push(`/game/${game.id}`)}
                      >
                        View Game
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {ongoingGames.length === 0 && endedGames.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          You haven't played any games yet. Create a new game to get started!
        </Typography>
      )}
    </Box>
  );
};

export default GamesList;