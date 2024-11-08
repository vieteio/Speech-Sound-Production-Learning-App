import React, { useCallback, useState } from 'react';
import { Box, Button, CircularProgress, Typography, Paper, Fade } from '@mui/material';
import { useConfiguration } from '../hooks/useConfiguration';
import { PhonemeMetadata } from '../types/configuration';

interface ConfigurationInterfaceProps {
  onConfigured: (success: boolean) => void;
}

export const ConfigurationInterface: React.FC<ConfigurationInterfaceProps> = ({ onConfigured }) => {
  const { state, uploadReference } = useConfiguration();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
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
  };

  return (
    <Fade in timeout={300}>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: isDragging ? 'primary.main' : 'primary.light',
            borderRadius: '12px',
            transition: 'all 0.2s ease-in-out',
            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
          }}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Typography variant="h5" gutterBottom color="primary.main">
            Initial Configuration Required
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              What is this?
            </Typography>
            <Typography paragraph color="text.secondary">
              This app helps you learn to pronounce speech sounds correctly. Before you can start practicing,
              we need a reference recording of the correct pronunciation to compare against.
            </Typography>
            <Typography paragraph color="text.secondary">
              For the Hebrew 'ר' sound (rolling R), please upload a clear recording of a native speaker
              pronouncing the sound correctly. This will be used as the target for your practice.
            </Typography>
          </Box>

          <Box 
            sx={{ 
              mb: 4, 
              p: 3, 
              backgroundColor: 'primary.light',
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recording Guidelines:
            </Typography>
            <Typography component="ul" color="text.secondary">
              <li>Use a quiet environment with minimal background noise</li>
              <li>Record a single, clear pronunciation of the 'ר' sound</li>
              <li>Keep the recording between 1-2 seconds</li>
              <li>Ensure the volume is neither too loud nor too quiet</li>
            </Typography>
          </Box>

          <Box 
            sx={{ 
              mt: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <input
              accept="audio/*"
              style={{ display: 'none' }}
              id="reference-audio-upload"
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              disabled={state.isConfiguring}
            />
            <label htmlFor="reference-audio-upload">
              <Button
                variant="contained"
                component="span"
                disabled={state.isConfiguring}
                size="large"
                sx={{
                  minWidth: 200,
                  height: 48,
                }}
              >
                {state.isConfiguring ? 'Processing...' : 'Upload Reference Audio'}
              </Button>
            </label>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              align="center"
            >
              or drag and drop an audio file here
            </Typography>
            
            {state.isConfiguring && (
              <Fade in timeout={200}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 2,
                  backgroundColor: 'primary.light',
                  borderRadius: 2,
                  width: '100%',
                }}>
                  <CircularProgress size={24} />
                  <Typography>
                    Processing reference audio... This may take a few moments while we analyze the sound patterns.
                  </Typography>
                </Box>
              </Fade>
            )}
            
            {state.error && (
              <Fade in timeout={200}>
                <Typography 
                  color="error" 
                  sx={{ 
                    mt: 2,
                    p: 2,
                    backgroundColor: 'error.light',
                    borderRadius: 2,
                    width: '100%',
                  }}
                >
                  {state.error}
                </Typography>
              </Fade>
            )}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}; 