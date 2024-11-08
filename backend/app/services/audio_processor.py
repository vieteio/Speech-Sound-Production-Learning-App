import numpy as np
import librosa
import logging
import soundfile as sf
import tempfile
import os
from io import BytesIO
from ..models.audio import AudioAnalysisResponse, FrequencyFeatures, AmplitudeFeatures

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.sample_rate = 22050  # Standard for speech analysis
        # Add default target values or load from configuration
        self.target_features = {
            'fundamental_freq': 200.0,  # Example target fundamental frequency
            'centroid': 1000.0,        # Example target centroid
            'rms': 0.5                 # Example target RMS
        }
        
    def calculate_similarity_score(self, 
                                 freq_features: FrequencyFeatures, 
                                 amp_features: AmplitudeFeatures) -> float:
        # Calculate weighted similarity score
        fundamental_diff = abs(freq_features.fundamental - self.target_features['fundamental_freq'])
        centroid_diff = abs(freq_features.centroid - self.target_features['centroid'])
        rms_diff = abs(amp_features.rms - self.target_features['rms'])
        
        # Normalize differences to 0-1 range
        fundamental_score = max(0, 100 - (fundamental_diff / 10))
        centroid_score = max(0, 100 - (centroid_diff / 100))
        rms_score = max(0, 100 - (rms_diff * 200))
        
        # Weighted average
        total_score = (
            fundamental_score * 0.4 +
            centroid_score * 0.4 +
            rms_score * 0.2
        )
        
        return min(100, max(0, total_score))  # Ensure score is between 0 and 100

    async def analyze(self, audio_data: BytesIO) -> AudioAnalysisResponse:
        try:
            # Create a temporary WAV file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
                # Write the audio data to the temporary file
                temp_file.write(audio_data.getvalue())
            
            try:
                # Read the temporary file
                data, samplerate = sf.read(temp_path)
                
                # Convert to mono if stereo
                if len(data.shape) > 1:
                    data = np.mean(data, axis=1)
                
                # Resample if necessary
                if samplerate != self.sample_rate:
                    data = librosa.resample(data, orig_sr=samplerate, target_sr=self.sample_rate)
                
                logger.info(f"Loaded audio: length={len(data)}, sample_rate={self.sample_rate}")
                
                # Extract features
                frequencies = self._extract_frequency_features(data)
                logger.info("Extracted frequency features")
                
                amplitudes = self._extract_amplitude_features(data)
                logger.info("Extracted amplitude features")
                
                # Calculate similarity score
                similarity_score = self.calculate_similarity_score(frequencies, amplitudes)
                
                return AudioAnalysisResponse(
                    frequency_features=frequencies,
                    amplitude_features=amplitudes,
                    similarity_score=similarity_score  # Now including the score
                )
            finally:
                # Clean up the temporary file
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file {temp_path}: {e}")
            
        except Exception as e:
            logger.error(f"Error in audio analysis: {str(e)}", exc_info=True)
            raise
    
    def _extract_frequency_features(self, y: np.ndarray) -> FrequencyFeatures:
        try:
            # Calculate fundamental frequency
            f0, voiced_flag, _ = librosa.pyin(
                y, 
                fmin=librosa.note_to_hz('C2'),
                fmax=librosa.note_to_hz('C7')
            )
            f0 = np.nanmean(f0[voiced_flag]) if any(voiced_flag) else 0.0
            
            # Calculate spectrum
            D = np.abs(librosa.stft(y))
            spectrum = np.mean(D, axis=1)
            
            # Calculate spectral centroid
            centroid = librosa.feature.spectral_centroid(y=y, sr=self.sample_rate)
            centroid_mean = float(np.mean(centroid))
            
            return FrequencyFeatures(
                fundamental=float(f0),
                spectrum=spectrum.tolist()[:100],  # First 100 components
                centroid=centroid_mean
            )
        except Exception as e:
            logger.error(f"Error extracting frequency features: {str(e)}", exc_info=True)
            raise
    
    def _extract_amplitude_features(self, y: np.ndarray) -> AmplitudeFeatures:
        try:
            # Calculate amplitude envelope
            envelope = librosa.feature.rms(y=y)
            
            # Calculate RMS energy
            rms = float(np.mean(envelope))
            
            return AmplitudeFeatures(
                envelope=envelope[0].tolist(),
                rms=rms
            )
        except Exception as e:
            logger.error(f"Error extracting amplitude features: {str(e)}", exc_info=True)
            raise 