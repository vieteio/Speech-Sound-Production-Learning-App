import { useState, useCallback } from 'react';
import { AudioProcessor, AudioQualityMetrics } from '../services/AudioProcessor';

interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
}

export const useAudioProcessor = () => {
  const [processor] = useState(() => new AudioProcessor());
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
  });

  const processAudio = useCallback(async (audioBlob: Blob) => {
    setState({ isProcessing: true, error: null });
    
    try {
      const result = await processor.processAudio(audioBlob);
      setState({ isProcessing: false, error: null });
      return result;
    } catch (error) {
      setState({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Processing failed'
      });
      throw error;
    }
  }, [processor]);

  return {
    state,
    processAudio,
  };
}; 