import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ConfigurationWrapper } from './ConfigurationWrapper';
import { ConfigurationMenu } from './ConfigurationMenu';
import { ConfigurationInterface } from './ConfigurationInterface';
import { RecordingInterface } from './RecordingInterface';

export const SoundLearningApp: React.FC = () => {
  const [showConfig, setShowConfig] = useState(false);

  if (showConfig) {
    return (
      <Box sx={{ p: 2 }}>
        <ConfigurationInterface 
          onConfigured={(success) => {
            if (success) {
              localStorage.removeItem('configuration_status');
              window.location.reload();
            }
            setShowConfig(false);
          }} 
        />
      </Box>
    );
  }

  return (
    <ConfigurationWrapper>
      {(isConfigured) => (
        <Box sx={{ p: 2, position: 'relative' }}>
          {isConfigured && (
            <ConfigurationMenu onReconfigure={() => setShowConfig(true)} />
          )}
          {isConfigured && <RecordingInterface />}
        </Box>
      )}
    </ConfigurationWrapper>
  );
}; 