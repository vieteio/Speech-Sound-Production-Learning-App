import { useState, useEffect } from 'react';
import { ConfigurationService } from '../services';

const CACHE_KEY = 'configuration_status';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useConfigurationCheck = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        setIsChecking(true);
        
        // Always check on app start
        const service = new ConfigurationService();
        const status = await service.checkConfiguration();
        
        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          status: status.isConfigured,
          timestamp: Date.now()
        }));

        console.log('Configuration check result:', status.isConfigured);
        setIsConfigured(status.isConfigured);
      } catch (err) {
        console.error('Configuration check failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to check configuration');
        setIsConfigured(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Run check immediately on mount
    checkConfiguration();
  }, []); // Empty deps array ensures this only runs once on mount

  return { isConfigured, isChecking, error };
}; 