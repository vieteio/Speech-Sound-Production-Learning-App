import { useState, useCallback } from 'react';
import { ConfigurationService } from '../services/ConfigurationService';
import { PhonemeMetadata, PhonemeReference } from '../types/configuration';

interface ConfigurationState {
  isConfiguring: boolean;
  error: string | null;
  currentReference: PhonemeReference | null;
}

export const useConfiguration = () => {
  const [service] = useState(() => new ConfigurationService());
  const [state, setState] = useState<ConfigurationState>({
    isConfiguring: false,
    error: null,
    currentReference: null,
  });

  const uploadReference = useCallback(async (file: File, metadata: PhonemeMetadata) => {
    setState(prev => ({ ...prev, isConfiguring: true, error: null }));
    
    try {
      const reference = await service.uploadReference(file, metadata);
      console.log('Initial reference:', reference);

      const withFeatures = await service.extractFeatures(reference.id);
      console.log('Reference with features:', withFeatures);

      const configured = await service.setParameters(reference.id);
      console.log('Fully configured reference:', configured);

      setState(prev => ({
        ...prev,
        isConfiguring: false,
        currentReference: configured,
      }));
      
      // Invalidate configuration status cache
      localStorage.removeItem('configuration_status');
      
      return configured;
    } catch (error) {
      console.error('Configuration error:', error);
      setState(prev => ({
        ...prev,
        isConfiguring: false,
        error: error instanceof Error ? error.message : 'Configuration failed',
      }));
      throw error;
    }
  }, [service]);

  return {
    state,
    uploadReference,
  };
}; 