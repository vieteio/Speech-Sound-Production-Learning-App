import numpy as np
import librosa
from pathlib import Path
from ..models.phoneme import PhonemeFeatures
from ..models.audio import AudioFeatures

class FeatureExtractor:
    def __init__(self):
        self.sample_rate = 22050  # Standard for speech analysis

    async def extract_features(self, audio_path: Path) -> PhonemeFeatures:
        """Extract acoustic features from audio file."""
        try:
            # Load audio file
            y, sr = librosa.load(str(audio_path), sr=self.sample_rate)
            
            # Calculate features
            frequencies = np.abs(librosa.stft(y))
            centroid = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())
            rms = float(librosa.feature.rms(y=y).mean())
            
            # Get frequency range
            freq_range = self._calculate_frequency_range(frequencies)
            
            # Get amplitude range
            amp_range = self._calculate_amplitude_range(y)
            
            # Get duration range
            duration = float(len(y) / sr)
            dur_range = (max(0.1, duration * 0.8), duration * 1.2)
            
            return PhonemeFeatures(
                frequencyRange=freq_range,
                amplitudeRange=amp_range,
                durationRange=dur_range,
                centroid=centroid,
                rms=rms
            )
            
        except Exception as e:
            raise Exception(f"Feature extraction failed: {str(e)}")

    def _calculate_frequency_range(self, frequencies: np.ndarray) -> tuple[float, float]:
        """Calculate the significant frequency range."""
        freq_profile = frequencies.mean(axis=1)
        threshold = freq_profile.max() * 0.1
        
        significant_freqs = np.where(freq_profile > threshold)[0]
        if len(significant_freqs) == 0:
            return (0.0, 1000.0)  # Default range
            
        min_freq = float(significant_freqs[0] * self.sample_rate / frequencies.shape[0])
        max_freq = float(significant_freqs[-1] * self.sample_rate / frequencies.shape[0])
        
        return (min_freq, max_freq)

    def _calculate_amplitude_range(self, y: np.ndarray) -> tuple[float, float]:
        """Calculate the acceptable amplitude range."""
        rms = librosa.feature.rms(y=y)[0]
        mean_rms = float(rms.mean())
        return (mean_rms * 0.5, mean_rms * 1.5)

    def calculate_ranges(self, features: PhonemeFeatures, tolerance: float) -> PhonemeFeatures:
        """Apply tolerance to feature ranges."""
        tolerance_factor = tolerance / 100.0
        
        freq_mid = sum(features.frequencyRange) / 2
        freq_range = (
            freq_mid * (1 - tolerance_factor),
            freq_mid * (1 + tolerance_factor)
        )
        
        amp_mid = sum(features.amplitudeRange) / 2
        amp_range = (
            amp_mid * (1 - tolerance_factor),
            amp_mid * (1 + tolerance_factor)
        )
        
        return PhonemeFeatures(
            frequencyRange=freq_range,
            amplitudeRange=amp_range,
            durationRange=features.durationRange,
            centroid=features.centroid,
            rms=features.rms
        )

    def calculate_similarity(self, features1: AudioFeatures, features2: AudioFeatures | None) -> float:
        """Calculate similarity score between two sets of features."""
        if not features2:
            return 0.0
            
        try:
            # Calculate frequency range similarity
            freq_mid1 = sum(features1.frequencyRange) / 2
            freq_mid2 = sum(features2.frequencyRange) / 2
            freq_diff = abs(freq_mid1 - freq_mid2) / max(freq_mid1, freq_mid2)
            freq_score = max(0, 1 - freq_diff)

            # Calculate amplitude similarity
            amp_diff = abs(features1.rms - features2.rms) / max(features1.rms, features2.rms)
            amp_score = max(0, 1 - amp_diff)

            # Calculate centroid similarity
            centroid_diff = abs(features1.centroid - features2.centroid) / max(features1.centroid, features2.centroid)
            centroid_score = max(0, 1 - centroid_diff)

            # Weighted average
            similarity = (
                freq_score * 0.4 +
                amp_score * 0.3 +
                centroid_score * 0.3
            ) * 100  # Convert to percentage

            return min(100, max(0, similarity))  # Ensure score is between 0 and 100
            
        except Exception as e:
            print(f"Error calculating similarity: {str(e)}")
            return 0.0