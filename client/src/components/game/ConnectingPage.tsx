'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const ConnectingPage: React.FC = () => {
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
      <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
      <Typography variant="h5" component="h2" gutterBottom>
        Connecting to game...
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
        Please wait while we establish a connection to the game server.
      </Typography>
    </Box>
  );
};

export default ConnectingPage;