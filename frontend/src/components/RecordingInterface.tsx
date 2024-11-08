import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useAudioProcessor } from '../hooks/useAudioProcessor';
import { AudioAnalysisService } from '../services/AudioAnalysisService';
import { AudioVisualizer } from './AudioVisualizer';
import { AudioFeedback } from './AudioFeedback';
import { AudioAnalysisResponse } from '../types/audio';

export const RecordingInterface: React.FC = () => {
  const { state: recorderState, initialize, startRecording, stopRecording } = useAudioRecorder();
  const { state: processorState, processAudio } = useAudioProcessor();
  const [analysisService] = useState(() => new AudioAnalysisService());
  const [analysis, setAnalysis] = useState<AudioAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialize().catch((err: Error) => {
      setError(err.message);
    });
  }, [initialize]);

  const handleStartRecording = async () => {
    setError(null);
    try {
      await startRecording();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      const { buffer } = await processAudio(audioBlob);
      const analysisResult = await analysisService.analyzeAudio(audioBlob);
      setAnalysis(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process recording');
    }
  };

  const isLoading = processorState.isProcessing || recorderState.isRecording;
  const hasError = error || recorderState.error || processorState.error;

  return (
    <Box sx={{ p: 3 }}>
      {hasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {hasError}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartRecording}
          disabled={!recorderState.isInitialized || recorderState.isRecording}
        >
          Start Recording
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleStopRecording}
          disabled={!recorderState.isRecording}
        >
          Stop Recording
        </Button>

        {isLoading && <CircularProgress size={24} />}
      </Box>

      {analysis && (
        <>
          <AudioVisualizer
            frequencyFeatures={analysis.frequency_features}
            amplitudeFeatures={analysis.amplitude_features}
          />
          <AudioFeedback
            frequencyFeatures={analysis.frequency_features}
            amplitudeFeatures={analysis.amplitude_features}
            similarityScore={analysis.similarity_score}
          />
        </>
      )}
    </Box>
  );
}; 