'use client';

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useRouter } from 'next/navigation';

interface ErrorPageProps {
  errorName?: string;
  errorMessage?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ errorName, errorMessage }) => {
  const router = useRouter();

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
      <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 3 }} />
      <Typography variant="h5" component="h2" gutterBottom>
        {errorName || 'Error'}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4, maxWidth: 500 }}>
        {errorMessage || 'An unexpected error occurred. Please try again later.'}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => router.push('/dashboard')}
      >
        Return to Dashboard
      </Button>
    </Box>
  );
};

export default ErrorPage;