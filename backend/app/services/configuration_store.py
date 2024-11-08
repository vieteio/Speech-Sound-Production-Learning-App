import json
from pathlib import Path
from typing import Dict, Optional
from ..models.phoneme import PhonemeReference

class ConfigurationStore:
    def __init__(self, storage_dir: Path):
        self.storage_dir = storage_dir
        # Create all necessary directories
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        (self.storage_dir.parent / "reference_audio").mkdir(parents=True, exist_ok=True)
        
        self._references: Dict[str, PhonemeReference] = {}
        self._load_references()
        print(f"ConfigurationStore initialized at {storage_dir}")

    def _load_references(self):
        """Load all reference configurations from storage directory."""
        for file in self.storage_dir.glob("*.json"):
            try:
                if file.stat().st_size > 0:
                    with file.open('r', encoding='utf-8') as f:
                        data = json.load(f)
                        reference = PhonemeReference.parse_obj(data)
                        self._references[reference.id] = reference
            except Exception as e:
                print(f"Failed to load reference from {file}: {str(e)}")

    def save_reference(self, reference: PhonemeReference):
        """Save a reference configuration to storage."""
        try:
            self._references[reference.id] = reference
            file_path = self.storage_dir / f"{reference.id}.json"
            
            # Write to temporary file first
            temp_path = file_path.with_suffix('.tmp')
            with temp_path.open('w', encoding='utf-8') as f:
                f.write(reference.json())
            
            # Rename temporary file to final name
            temp_path.replace(file_path)
            
        except Exception as e:
            raise Exception(f"Failed to save reference: {str(e)}")

    def get_reference(self, reference_id: str) -> Optional[PhonemeReference]:
        """Get a reference configuration by ID."""
        return self._references.get(reference_id)

    def list_references(self) -> list[PhonemeReference]:
        """List all reference configurations."""
        return list(self._references.values()) 