import { useState, useCallback, useEffect } from 'react';
import { AudioRecorder } from '../services/AudioRecorder';

interface AudioRecorderState {
  isInitialized: boolean;
  isRecording: boolean;
  error: string | null;
}

export const useAudioRecorder = () => {
  const [recorder] = useState(() => new AudioRecorder());
  const [state, setState] = useState<AudioRecorderState>({
    isInitialized: false,
    isRecording: false,
    error: null,
  });

  useEffect(() => {
    return () => {
      recorder.cleanup();
    };
  }, [recorder]);

  const initialize = useCallback(async () => {
    try {
      await recorder.initialize();
      setState(prev => ({ ...prev, isInitialized: true, error: null }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to initialize microphone access'
      }));
      throw error;
    }
  }, [recorder]);

  const startRecording = useCallback(async () => {
    try {
      await recorder.startRecording();
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        error: 'Failed to start recording'
      }));
      throw error;
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    if (!state.isRecording) {
      throw new Error('Not recording');
    }

    try {
      const audioBlob = await recorder.stopRecording();
      setState(prev => ({ ...prev, isRecording: false, error: null }));
      return audioBlob;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        error: 'Failed to stop recording'
      }));
      throw error;
    }
  }, [recorder, state.isRecording]);

  // Add polling to sync state with actual recorder state
  useEffect(() => {
    if (!state.isInitialized) return;

    const interval = setInterval(() => {
      const isActuallyRecording = recorder.isRecording();
      if (isActuallyRecording !== state.isRecording) {
        setState(prev => ({ ...prev, isRecording: isActuallyRecording }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [recorder, state.isInitialized, state.isRecording]);

  return {
    state,
    initialize,
    startRecording,
    stopRecording,
  };
}; 