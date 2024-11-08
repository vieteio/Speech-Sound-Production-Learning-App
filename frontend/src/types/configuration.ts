export interface PhonemeMetadata {
  language: string;
  symbol: string;
  description?: string;
}

export interface PhonemeFeatures {
  frequencyRange: [number, number];
  amplitudeRange: [number, number];
  durationRange: [number, number];
  centroid: number;
  rms: number;
}

export interface FeedbackRules {
  thresholds: [number, number];
  messages: {
    success: string;
    close: string;
    retry: string;
  };
}

export interface PhonemeReference {
  id: string;
  language: string;
  symbol: string;
  audioPath: string;
  features?: PhonemeFeatures;
  feedbackRules?: FeedbackRules;
} 