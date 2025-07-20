'use client';

import React, { useState } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ClientRoom } from '@/lib/game-client/GameClient';

interface WaitingPageProps {
  room: ClientRoom;
}

const WaitingPage: React.FC<WaitingPageProps> = ({ room }) => {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 64px)',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', mb: 4 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Waiting for Opponent
          </Typography>
          
          <CircularProgress size={60} thickness={4} sx={{ my: 3 }} />
          
          <Typography variant="body1" paragraph>
            Share this room ID with your opponent:
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 2 
            }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontFamily: 'monospace', 
                letterSpacing: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                padding: '8px 16px',
                borderRadius: 1,
                mr: 1
              }}
            >
              {room.id}
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
              onClick={copyRoomId}
              sx={{ minWidth: 100 }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            The game will start automatically when your opponent joins.
          </Typography>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="text.secondary">
        Game settings: {room.gameRules.timer ? `Timed (${room.gameRules.initialTime! / 60} min)` : 'Untimed'}
        {room.gameRules.hostPreferredColor ? ` • Playing as ${room.gameRules.hostPreferredColor}` : ' • Random colors'}
      </Typography>
    </Box>
  );
};

export default WaitingPage;