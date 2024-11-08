import React, { useCallback } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useConfiguration } from '../hooks/useConfiguration';
import { PhonemeMetadata } from '../types/configuration';

interface ConfigurationInterfaceProps {
  onConfigured: (success: boolean) => void;
}

export const ConfigurationInterface: React.FC<ConfigurationInterfaceProps> = ({ onConfigured }) => {
  const { state, uploadReference } = useConfiguration();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const metadata: PhonemeMetadata = {
      language: 'he',
      symbol: 'ר',
      description: 'Hebrew rolling R'
    };

    try {
      const reference = await uploadReference(file, metadata);
      console.log('Reference configured:', reference);
      onConfigured(true);
    } catch (error) {
      console.error('Configuration failed:', error);
      onConfigured(false);
    }
  }, [uploadReference, onConfigured]);

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Initial Configuration Required
      </Typography>
      
      <Typography paragraph>
        Please upload a reference audio file for the Hebrew 'ר' sound.
        This will be used as the target pronunciation for comparison.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <input
          accept="audio/*"
          style={{ display: 'none' }}
          id="reference-audio-upload"
          type="file"
          onChange={handleFileUpload}
          disabled={state.isConfiguring}
        />
        <label htmlFor="reference-audio-upload">
          <Button
            variant="contained"
            component="span"
            disabled={state.isConfiguring}
          >
            Upload Reference Audio
          </Button>
        </label>
        
        {state.isConfiguring && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Processing reference audio...</Typography>
          </Box>
        )}
        
        {state.error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {state.error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}; 