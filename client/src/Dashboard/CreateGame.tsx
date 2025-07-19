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
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Switch,
  Slider,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Color } from '@/GameClient/DataModel';
import { useAuth } from '@/Auth/AuthContext';

// Mock function to create a game - this would be replaced with an actual API call
const createGame = async (gameSettings: any) => {
  // This would be an API call to create a game
  return { roomId: 'room-' + Math.random().toString(36).substring(2, 9) };
};

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameMode, setGameMode] = useState('custom');
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [initialTime, setInitialTime] = useState(180); // 3 minutes in seconds
  const [increment, setIncrement] = useState(2); // 2 seconds increment
  const [preferredColor, setPreferredColor] = useState<Color | 'random'>('random');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const gameSettings = {
        hostId: user?.id,
        gameRules: {
          timer: timerEnabled,
          initialTime: initialTime,
          timerIncrement: increment,
          hostPreferredColor: preferredColor !== 'random' ? preferredColor : undefined,
        },
      };

      const response = await createGame(gameSettings);
      navigate(`/game/${response.roomId}`);
    } catch (error) {
      console.error('Failed to create game:', error);
      // Handle error
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
            Create New Game
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" gutterBottom>
              Game Settings
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Game Mode
              </Typography>
              <RadioGroup
                row
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
              >
                <FormControlLabel value="bullet" control={<Radio />} label="Bullet (1|0)" />
                <FormControlLabel value="blitz" control={<Radio />} label="Blitz (3|2)" />
                <FormControlLabel value="rapid" control={<Radio />} label="Rapid (10|5)" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
              </RadioGroup>
            </FormControl>

            {gameMode === 'custom' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Timer Settings
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={timerEnabled}
                          onChange={(e) => setTimerEnabled(e.target.checked)}
                        />
                      }
                      label="Enable Timer"
                    />
                  </Grid>

                  {timerEnabled && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography id="initial-time-slider" gutterBottom>
                          Initial Time (minutes)
                        </Typography>
                        <Slider
                          value={initialTime / 60}
                          onChange={(_, value) => setInitialTime((value as number) * 60)}
                          aria-labelledby="initial-time-slider"
                          valueLabelDisplay="auto"
                          step={1}
                          marks
                          min={1}
                          max={30}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography id="increment-slider" gutterBottom>
                          Increment (seconds)
                        </Typography>
                        <Slider
                          value={increment}
                          onChange={(_, value) => setIncrement(value as number)}
                          aria-labelledby="increment-slider"
                          valueLabelDisplay="auto"
                          step={1}
                          marks
                          min={0}
                          max={10}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Preferred Color
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={preferredColor}
                  onChange={(e) => setPreferredColor(e.target.value as Color | 'random')}
                >
                  <MenuItem value="random">Random</MenuItem>
                  <MenuItem value={Color.White}>White</MenuItem>
                  <MenuItem value={Color.Black}>Black</MenuItem>
                </Select>
              </FormControl>
            </Box>

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
                {loading ? 'Creating...' : 'Create Game'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};