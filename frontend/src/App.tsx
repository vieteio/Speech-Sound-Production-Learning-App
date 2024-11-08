import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SoundLearningApp } from './components';

// Create theme (you can customize this)
const theme = createTheme();

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SoundLearningApp />
    </ThemeProvider>
  );
}; 