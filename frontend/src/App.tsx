import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SoundLearningApp } from './components';
import { theme } from './theme';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SoundLearningApp />
    </ThemeProvider>
  );
}; 