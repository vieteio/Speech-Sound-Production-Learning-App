import { AudioQualityMetrics } from '../types/audio';

export class AudioProcessor {
  private context: AudioContext | null = null;

  private async ensureContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new AudioContext();
      
      // Resume context if it's in suspended state
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
    }
    return this.context;
  }

  async processAudio(audioBlob: Blob): Promise<{
    buffer: AudioBuffer;
    quality: AudioQualityMetrics;
  }> {
    try {
      // Initialize context only when processing audio
      const context = await this.ensureContext();
      
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      
      const quality = this.analyzeQuality(audioBuffer);
      
      if (quality.duration < 0.1) {
        throw new Error('Recording too short');
      }
      
      if (quality.isClipping) {
        throw new Error('Audio signal is clipping');
      }
      
      const normalizedBuffer = await this.normalizeAudio(audioBuffer);
      
      return {
        buffer: normalizedBuffer,
        quality
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Audio processing failed: ${error}`);
    }
  }

  private analyzeQuality(buffer: AudioBuffer): AudioQualityMetrics {
    const channelData = buffer.getChannelData(0);
    let maxAmplitude = 0;
    let avgAmplitude = 0;
    
    for (let i = 0; i < channelData.length; i++) {
      const amplitude = Math.abs(channelData[i]);
      maxAmplitude = Math.max(maxAmplitude, amplitude);
      avgAmplitude += amplitude;
    }
    avgAmplitude /= channelData.length;

    return {
      duration: buffer.duration,
      maxAmplitude,
      avgAmplitude,
      isClipping: maxAmplitude > 0.99,
      isTooQuiet: avgAmplitude < 0.01
    };
  }

  private async normalizeAudio(buffer: AudioBuffer): Promise<AudioBuffer> {
    const context = await this.ensureContext();
    const channelData = buffer.getChannelData(0);
    const normalizedData = new Float32Array(channelData.length);
    
    // Find peak amplitude
    let peak = 0;
    for (let i = 0; i < channelData.length; i++) {
      peak = Math.max(peak, Math.abs(channelData[i]));
    }
    
    // Normalize to target peak (0.9 to avoid clipping)
    const scale = peak > 0 ? 0.9 / peak : 1;
    for (let i = 0; i < channelData.length; i++) {
      normalizedData[i] = channelData[i] * scale;
    }
    
    const normalizedBuffer = context.createBuffer(
      1,
      buffer.length,
      buffer.sampleRate
    );
    normalizedBuffer.copyToChannel(normalizedData, 0);
    
    return normalizedBuffer;
  }
} 