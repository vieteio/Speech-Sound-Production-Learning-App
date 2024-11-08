from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Dict
from uuid import uuid4
from pathlib import Path
import json
import shutil
from pydantic import BaseModel

from ..models.phoneme import PhonemeMetadata, PhonemeReference, PhonemeFeatures
from ..services.feature_extractor import FeatureExtractor
from ..services.configuration_store import ConfigurationStore

router = APIRouter(prefix="/api/config")
feature_extractor = FeatureExtractor()
config_store = ConfigurationStore(Path("data/configurations"))

class SetParametersRequest(BaseModel):
    tolerance: float

@router.get("/status")
async def check_configuration() -> Dict[str, bool]:
    """Check if the system has been configured with reference data."""
    try:
        # Get all references
        references = list(config_store._references.values())
        
        # Check if we have any fully configured references
        configured_refs = [
            ref for ref in references 
            if ref.features is not None  # Has extracted features
        ]
        
        print(f"Configuration check: Found {len(configured_refs)} configured references")
        
        return {
            "isConfigured": len(configured_refs) > 0
        }
    except Exception as e:
        print(f"Configuration check error: {str(e)}")
        raise HTTPException(500, f"Failed to check configuration: {str(e)}")

@router.post("/reference-audio")
async def upload_reference(
    audio: UploadFile = File(...),
    metadata: str = Form(...)
) -> PhonemeReference:
    try:
        phoneme_metadata = PhonemeMetadata.parse_raw(metadata)
    except Exception as e:
        raise HTTPException(400, f"Invalid metadata format: {str(e)}")

    if not audio.content_type.startswith("audio/"):
        raise HTTPException(400, "File must be audio")
    
    reference_id = str(uuid4())
    audio_path = Path("data/reference_audio") / f"{reference_id}.wav"
    
    audio_path.parent.mkdir(parents=True, exist_ok=True)
    
    with audio_path.open("wb") as f:
        shutil.copyfileobj(audio.file, f)
    
    reference = PhonemeReference(
        id=reference_id,
        language=phoneme_metadata.language,
        symbol=phoneme_metadata.symbol,
        audioPath=str(audio_path)
    )
    
    config_store.save_reference(reference)
    
    return reference

@router.post("/extract-features/{reference_id}")
async def extract_features(reference_id: str) -> PhonemeReference:
    reference = config_store.get_reference(reference_id)
    if not reference:
        raise HTTPException(404, "Reference not found")
    
    features = await feature_extractor.extract_features(Path(reference.audioPath))
    reference.features = features
    
    config_store.save_reference(reference)
    return reference

@router.post("/set-parameters/{reference_id}")
async def set_parameters(
    reference_id: str,
    request: SetParametersRequest
) -> PhonemeReference:
    reference = config_store.get_reference(reference_id)
    if not reference:
        raise HTTPException(404, "Reference not found")
    
    if not reference.features:
        raise HTTPException(400, "Features must be extracted first")
    
    # Apply tolerance to create acceptable ranges
    reference.features = feature_extractor.calculate_ranges(
        reference.features,
        request.tolerance
    )
    
    config_store.save_reference(reference)
    return reference 