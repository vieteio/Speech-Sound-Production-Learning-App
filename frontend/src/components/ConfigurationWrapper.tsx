import React from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useConfigurationCheck } from '../hooks';
import { ConfigurationInterface } from '.';

interface ConfigurationWrapperProps {
  children: (isConfigured: boolean) => React.ReactNode;
}

export const ConfigurationWrapper: React.FC<ConfigurationWrapperProps> = ({ children }) => {
  const { isConfigured, isChecking, error } = useConfigurationCheck();

  if (isChecking) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Checking configuration...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center' 
      }}>
        <Typography color="error" gutterBottom>
          Configuration check failed: {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!isConfigured) {
    return <ConfigurationInterface onConfigured={() => window.location.reload()} />;
  }

  return <>{children(isConfigured)}</>;
}; 