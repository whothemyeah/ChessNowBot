'use client';

import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { useRouter } from 'next/navigation';
import { GameResolution, User } from '@/lib/game-client/DataModel';

interface GameResultPopupProps {
  resolution: GameResolution;
  winner?: User;
  myUser: User;
}

const GameResultPopup: React.FC<GameResultPopupProps> = ({ resolution, winner, myUser }) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);
  
  const isWinner = winner?.id === myUser.id;
  const isDraw = !winner;
  
  const getTitle = () => {
    if (isDraw) return 'Game Drawn';
    return isWinner ? 'You Won!' : 'You Lost';
  };
  
  const getIcon = () => {
    if (isDraw) return <HandshakeIcon sx={{ fontSize: 60, color: 'info.main' }} />;
    return isWinner 
      ? <EmojiEventsIcon sx={{ fontSize: 60, color: 'warning.main' }} />
      : <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60, color: 'text.secondary' }} />;
  };
  
  const getResolutionText = () => {
    switch (resolution) {
      case GameResolution.Checkmate:
        return 'by checkmate';
      case GameResolution.OutOfTime:
        return 'on time';
      case GameResolution.PlayerQuit:
        return 'by opponent disconnection';
      case GameResolution.GiveUp:
        return 'by resignation';
      case GameResolution.Stalemate:
        return 'by stalemate';
      case GameResolution.Draw:
        return 'by agreement';
      default:
        return '';
    }
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="game-result-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="game-result-dialog-title" sx={{ textAlign: 'center' }}>
        {getTitle()}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          {getIcon()}
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            {isDraw ? 'Game Drawn' : (isWinner ? 'Victory!' : 'Defeat')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center">
            {isDraw 
              ? `The game ended in a draw ${getResolutionText()}.`
              : `${isWinner ? 'You won' : winner?.fullName || 'Opponent won'} ${getResolutionText()}.`
            }
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button onClick={handleClose} color="primary">
          Stay Here
        </Button>
        <Button onClick={handleBackToDashboard} variant="contained" color="primary">
          Back to Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameResultPopup;