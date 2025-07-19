import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from '@/Auth/AuthContext';
import { LoginPage } from '@/Auth/LoginPage';
import { RegisterPage } from '@/Auth/RegisterPage';
import { ProtectedRoute } from '@/Auth/ProtectedRoute';
import { Dashboard } from '@/Dashboard/Dashboard';
import { CreateGame } from '@/Dashboard/CreateGame';
import { JoinGame } from '@/Dashboard/JoinGame';
import { UserProfile } from '@/Dashboard/UserProfile';
import { GameView } from '@/GameView/GameView';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-game" element={<CreateGame />} />
              <Route path="/join-game" element={<JoinGame />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/game/:roomId" element={<GameView />} />
            </Route>
            
            {/* Redirect to dashboard if authenticated, otherwise to login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};
