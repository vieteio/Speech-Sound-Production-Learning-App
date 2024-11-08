import { AudioAnalysisResponse } from '../types/audio';

export class AudioAnalysisService {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async analyzeAudio(audioBlob: Blob): Promise<AudioAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    const response = await fetch(`${this.baseUrl}/audio/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Analysis failed: ${error}`);
    }

    return response.json();
  }
} 