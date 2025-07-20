'use client';

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Member } from '@/lib/game-client/DataModel';

interface PlayerBarProps {
  player?: Member;
  isMyTurn: boolean;
  timer?: number;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ player, isMyTurn, timer }) => {
  // Format timer as mm:ss
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 600,
        p: 1,
        borderRadius: 1,
        bgcolor: isMyTurn ? 'rgba(144, 238, 144, 0.2)' : 'transparent',
        border: '1px solid',
        borderColor: isMyTurn ? 'success.main' : 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          src={player?.user.avatarURL} 
          alt={player?.user.fullName || 'Player'}
          sx={{ width: 40, height: 40, mr: 2 }}
        >
          {player?.user.fullName ? player.user.fullName[0] : '?'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">
            {player?.user.fullName || 'Waiting for player...'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {player?.user.username ? `@${player.user.username}` : ''}
          </Typography>
        </Box>
      </Box>
      
      {timer !== undefined && (
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'monospace',
            color: timer < 30000 ? 'error.main' : 'text.primary',
            animation: timer < 10000 ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        >
          {formatTime(timer)}
        </Typography>
      )}
    </Box>
  );
};

export default PlayerBar;