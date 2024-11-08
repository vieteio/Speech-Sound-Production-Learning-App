import { PhonemeMetadata, PhonemeReference } from '../types';

export class ConfigurationService {
  private baseUrl = '/api/config';

  async checkConfiguration(): Promise<{ isConfigured: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      
      if (!response.ok) {
        throw new Error('Failed to check configuration status');
      }
      
      const data = await response.json();
      console.log('Configuration status:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Configuration check error:', error);
      throw error;
    }
  }

  async uploadReference(file: File, metadata: PhonemeMetadata): Promise<PhonemeReference> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${this.baseUrl}/reference-audio`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload reference audio');
    }

    return response.json();
  }

  async extractFeatures(referenceId: string): Promise<PhonemeReference> {
    const response = await fetch(`${this.baseUrl}/extract-features/${referenceId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to extract features');
    }

    return response.json();
  }

  async setParameters(referenceId: string, tolerance: number = 20): Promise<PhonemeReference> {
    const response = await fetch(`${this.baseUrl}/set-parameters/${referenceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tolerance }),
    });

    if (!response.ok) {
      throw new Error('Failed to set parameters');
    }

    return response.json();
  }
} 