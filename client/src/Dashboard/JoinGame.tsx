import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const JoinGame: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!roomId.trim()) {
      setError('Please enter a game ID');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, you would verify the room exists
      // For now, we'll just navigate to the game page
      navigate(`/game/${roomId}`);
    } catch (error) {
      setError('Game not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            aria-label="back"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Join Game
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" gutterBottom>
              Enter Game ID
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="roomId"
              label="Game ID"
              name="roomId"
              autoFocus
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter the Game ID provided by the game creator to join their game.
            </Typography>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Game'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};