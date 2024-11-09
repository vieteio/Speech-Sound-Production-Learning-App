import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ConfigurationWrapper } from './ConfigurationWrapper';
import { ConfigurationMenu } from './ConfigurationMenu';
import { ConfigurationInterface } from './ConfigurationInterface';
import { RecordingInterface } from './RecordingInterface';

export const SoundLearningApp: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);

  const AppHeader = () => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        backgroundColor: 'primary.light',
        borderBottom: '1px solid',
        borderColor: 'primary.main',
        borderRadius: '12px',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Speech Sound Learning
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: 'text.secondary',
          maxWidth: '800px' 
        }}
      >
        Learn to pronounce speech sounds correctly with real-time feedback.
        Practice the Hebrew 'ר' sound and get instant analysis of your pronunciation.
      </Typography>
    </Paper>
  );

  if (showConfig) {
    return (
      <Box sx={{ p: 2 }}>
        <AppHeader />
        <ConfigurationInterface 
          onConfigured={(success) => {
            if (success) {
              localStorage.removeItem('configuration_status');
              setShowConfig(false);
              window.location.reload();
            }
          }} 
        />
      </Box>
    );
  }

  return (
    <ConfigurationWrapper>
      {(isConfigured) => (
        <Box sx={{ p: 2, position: 'relative' }}>
          <AppHeader />
          {isConfigured && (
            <ConfigurationMenu onReconfigure={() => setShowConfig(true)} />
          )}
          {isConfigured && <RecordingInterface />}
        </Box>
      )}
    </ConfigurationWrapper>
  );
}; 