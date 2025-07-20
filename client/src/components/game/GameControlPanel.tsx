'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { GameStatus } from '@/lib/game-client/DataModel';

interface GameControlPanelProps {
  isMyTurn: boolean;
  canGiveUp: boolean;
  onGiveUp: () => void;
  gameStatus: GameStatus;
}

const GameControlPanel: React.FC<GameControlPanelProps> = ({ 
  isMyTurn, 
  canGiveUp, 
  onGiveUp,
  gameStatus
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 2,
        width: '100%',
        maxWidth: 600,
      }}
    >
      {gameStatus === GameStatus.InProgress && (
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 2,
            color: isMyTurn ? 'success.main' : 'text.secondary',
            fontWeight: isMyTurn ? 'bold' : 'normal',
          }}
        >
          {isMyTurn ? 'Your turn' : 'Waiting for opponent'}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {canGiveUp && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<FlagIcon />}
            onClick={onGiveUp}
            size="small"
          >
            Give Up
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default GameControlPanel;