export interface FrequencyFeatures {
  fundamental: number;
  spectrum: number[];
  centroid: number;
}

export interface AmplitudeFeatures {
  envelope: number[];
  rms: number;
}

export interface AudioAnalysisResponse {
  frequency_features: FrequencyFeatures;
  amplitude_features: AmplitudeFeatures;
  similarity_score?: number;
}

export interface AudioQualityMetrics {
  duration: number;
  maxAmplitude: number;
  avgAmplitude: number;
  isClipping: boolean;
  isTooQuiet: boolean;
} 