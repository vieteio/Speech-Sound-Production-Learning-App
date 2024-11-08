export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };
      
      this.mediaRecorder.addEventListener('start', () => {
        this.chunks = [];
      });
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('Failed to initialize audio recorder'));
    }
  }

  async startRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Audio recorder not initialized');
    }
    
    if (this.mediaRecorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }
    
    this.chunks = [];
    this.mediaRecorder.start(100);
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Audio recorder not initialized'));
        return;
      }

      const handleStop = async () => {
        const webmBlob = new Blob(this.chunks, { 
          type: 'audio/webm;codecs=opus'
        });
        
        try {
          const wavBlob = await this.convertToWav(webmBlob);
          this.chunks = [];
          this.mediaRecorder?.removeEventListener('stop', handleStop);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.addEventListener('stop', handleStop);

      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      } else {
        reject(new Error('Not recording'));
      }
    });
  }

  private async convertToWav(webmBlob: Blob): Promise<Blob> {
    const audioContext = new AudioContext();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create WAV file
    const wavBuffer = this.audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const data = this.audioBufferToInt16Array(buffer);
    const dataSize = data.length * bytesPerSample;
    const fileSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(fileSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Write audio data
    data.forEach((sample, i) => {
      view.setInt16(44 + i * 2, sample, true);
    });
    
    return arrayBuffer;
  }

  private audioBufferToInt16Array(audioBuffer: AudioBuffer): Int16Array {
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    
    const length = audioBuffer.length * audioBuffer.numberOfChannels;
    const result = new Int16Array(length);
    
    let index = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        result[index++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
    }
    
    return result;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioContext = null;
    this.chunks = [];
  }
} 