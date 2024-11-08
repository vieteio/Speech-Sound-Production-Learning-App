from pydantic import BaseModel
from typing import Optional, Tuple, List

class PhonemeMetadata(BaseModel):
    language: str
    symbol: str
    description: Optional[str] = None

class PhonemeFeatures(BaseModel):
    frequencyRange: Tuple[float, float]
    amplitudeRange: Tuple[float, float]
    durationRange: Tuple[float, float]
    centroid: float
    rms: float

class FeedbackRules(BaseModel):
    thresholds: Tuple[float, float]
    messages: dict[str, str]

class PhonemeReference(BaseModel):
    id: str
    language: str
    symbol: str
    audioPath: str
    features: Optional[PhonemeFeatures] = None
    feedbackRules: Optional[FeedbackRules] = None 