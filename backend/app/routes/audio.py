from fastapi import APIRouter, UploadFile, File, HTTPException
from ..models.audio import AudioAnalysisResponse, FrequencyFeatures, AmplitudeFeatures, AudioFeatures
from ..services.feature_extractor import FeatureExtractor
from ..services.configuration_store import ConfigurationStore
from pathlib import Path
import numpy as np
import librosa

router = APIRouter(prefix="/api/audio")
feature_extractor = FeatureExtractor()
config_store = ConfigurationStore(Path("data/configurations"))

@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)) -> AudioAnalysisResponse:
    """Analyze uploaded audio and compare with reference."""
    temp_path = None
    try:
        if not file.content_type.startswith("audio/"):
            raise HTTPException(400, "File must be audio")
        
        # Save temporary file
        temp_path = Path("data/temp") / f"{file.filename}"
        temp_path.parent.mkdir(parents=True, exist_ok=True)
        
        with temp_path.open("wb") as f:
            content = await file.read()
            f.write(content)
        
        # Load audio for envelope calculation
        y, sr = librosa.load(str(temp_path), sr=22050)
        
        # Calculate real amplitude envelope
        frame_length = 2048
        hop_length = 512
        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        
        # Normalize envelope to 0-1 range and take 100 points
        envelope = librosa.util.normalize(rms)
        envelope = librosa.resample(envelope, orig_sr=len(envelope), target_sr=100)
        
        # Extract features as AudioFeatures
        features = await feature_extractor.extract_features(temp_path)
        
        # Get reference for comparison
        references = config_store.list_references()
        if not references:
            raise HTTPException(400, "No reference configuration found")
        
        reference = references[0]  # Use first reference for now
        
        # Calculate similarity score
        similarity_score = feature_extractor.calculate_similarity(
            AudioFeatures(
                frequencyRange=features.frequencyRange,
                amplitudeRange=features.amplitudeRange,
                durationRange=features.durationRange,
                centroid=features.centroid,
                rms=features.rms
            ),
            reference.features
        ) if reference.features else None
        
        # Calculate spectrum
        D = np.abs(librosa.stft(y))
        spectrum = np.mean(D, axis=1)
        spectrum = librosa.util.normalize(spectrum)
        spectrum = librosa.resample(spectrum, orig_sr=len(spectrum), target_sr=100)
        
        # Convert features to response format
        return AudioAnalysisResponse(
            frequency_features=FrequencyFeatures(
                fundamental=features.frequencyRange[0],
                spectrum=spectrum.tolist(),  # Real spectrum data
                centroid=features.centroid
            ),
            amplitude_features=AmplitudeFeatures(
                envelope=envelope.tolist(),  # Real envelope data
                rms=features.rms
            ),
            similarity_score=similarity_score
        )
        
    except Exception as e:
        print(f"Audio analysis error: {str(e)}")  # Log the error
        raise HTTPException(500, f"Analysis failed: {str(e)}")
    finally:
        # Cleanup
        if temp_path and temp_path.exists():
            try:
                temp_path.unlink()
            except Exception as e:
                print(f"Failed to cleanup temp file: {str(e)}")