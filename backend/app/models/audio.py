from pydantic import BaseModel
from typing import List, Tuple

class FrequencyFeatures(BaseModel):
    fundamental: float
    spectrum: List[float]
    centroid: float

class AmplitudeFeatures(BaseModel):
    envelope: List[float]
    rms: float

class AudioFeatures(BaseModel):
    frequencyRange: Tuple[float, float]
    amplitudeRange: Tuple[float, float]
    durationRange: Tuple[float, float]
    centroid: float
    rms: float

class AudioAnalysisResponse(BaseModel):
    frequency_features: FrequencyFeatures
    amplitude_features: AmplitudeFeatures
    similarity_score: float | None = None 