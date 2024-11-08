# Simplified Configuration Process

## Overview
A minimal configuration process focused on single-phoneme analysis (e.g., Hebrew 'ר'), using a single reference recording and basic acoustic parameters.

## Simplified Process Steps

### 1. Reference Audio Upload
**Input**:
- Single WAV file of correct pronunciation
- Basic metadata (language, phoneme symbol)

**Process**:
1. Upload WAV file through web interface
2. Validate audio format (44.1kHz, 16-bit)
3. Store in PostgreSQL with file reference

**Tech Stack**:
- Frontend: React dropzone component
- Backend: FastAPI file upload endpoint
- Storage: PostgreSQL + file system

### 2. Feature Extraction
**Input**:
- Uploaded reference audio

**Process**:
1. Extract basic acoustic features:
   - Frequency spectrum
   - Amplitude envelope
   - Duration

**Tech Stack**:
- Backend: librosa/scipy for feature extraction
- Cache: Redis for processed features

### 3. Parameter Range Definition
**Input**:
- Extracted features
- Basic tolerance settings (e.g., ±20%)

**Process**:
1. Calculate acceptable ranges:
   - Min/max frequency bounds
   - Amplitude tolerance
   - Duration limits

**Tech Stack**:
- Backend: Python numerical processing
- Storage: PostgreSQL

### 4. Basic Feedback Rules
**Input**:
- Three feedback levels (correct, close, incorrect)
- Generic improvement messages

**Process**:
1. Store simple scoring rules:
   - Score > 80% = "Correct"
   - Score 60-80% = "Close"
   - Score < 60% = "Try again"

**Tech Stack**:
- Storage: PostgreSQL simple rules table
- Backend: FastAPI endpoints

## Data Structure

```typescript
// Simplified Reference Data
interface SimplePhonemeReference {
  id: string;
  language: string;
  symbol: string;
  audioPath: string;
  features: {
    frequencyRange: [number, number];
    amplitudeRange: [number, number];
    durationRange: [number, number];
  };
  feedbackRules: {
    thresholds: [number, number]; // [60, 80]
    messages: string[];
  };
}
```

## Implementation Steps

### 1. Database Setup
```sql
CREATE TABLE phoneme_references (
  id SERIAL PRIMARY KEY,
  language VARCHAR(10),
  symbol VARCHAR(10),
  audio_path TEXT,
  features JSONB,
  feedback_rules JSONB
);
```

### 2. API Endpoints
```typescript
// Main configuration endpoints
POST /api/config/reference-audio
POST /api/config/extract-features
POST /api/config/set-parameters
GET  /api/config/reference/:id
```

### 3. Frontend Interface
- Simple form for audio upload
- Basic parameter adjustment sliders
- Preview of extracted features
- Test recording capability

## Minimal Configuration Flow

1. **Upload Reference**
   ```typescript
   async function uploadReference(file: File, metadata: PhonemeMetadata) {
     const formData = new FormData();
     formData.append('audio', file);
     formData.append('metadata', JSON.stringify(metadata));
     return await api.post('/config/reference-audio', formData);
   }
   ```

2. **Process Features**
   ```typescript
   async function processFeatures(referenceId: string) {
     const features = await api.post('/config/extract-features', { referenceId });
     return features;
   }
   ```

3. **Set Parameters**
   ```typescript
   async function setParameters(referenceId: string, tolerance: number = 20) {
     const params = await api.post('/config/set-parameters', {
       referenceId,
       tolerance
     });
     return params;
   }
   ```

## Validation Process

1. **Quick Test Recording**
   - Record test sound
   - Run comparison
   - Verify feedback

2. **Basic Checks**
   - Audio file loads correctly
   - Features extract successfully
   - Feedback generates properly

## Future Extension Points

1. Add multiple reference recordings
2. Implement more sophisticated parameters
3. Add age-specific variations
4. Include dialect support

This simplified configuration process provides the minimum viable setup needed to start the Sound Recording & Analysis Process. It can be implemented quickly while leaving room for future enhancements.

Would you like me to elaborate on any of these aspects or provide more specific technical details? 