# Sound Recording & Analysis Process - Data Flow Details

## Initial State
- Target phoneme configuration in PostgreSQL
- User session data in IndexedDB
- Audio recording permissions status

## Data Flow Steps

### 1. Recording Initialization
**Initial State**:
- Browser audio permissions: unknown
- AudioContext: not initialized
- MediaRecorder: not initialized

**Step Type**: System initialization & permission request

**Result States**:
1. Success:
   - AudioContext: initialized
   - MediaRecorder: ready
   - Recording status: ready
2. Error - Permission Denied:
   - Error message: "Microphone access denied"
   - Recording status: blocked
3. Error - Browser Incompatible:
   - Error message: "Browser not supported"
   - Recording status: unavailable

### 2. Audio Recording
**Initial State**:
- AudioContext: initialized
- MediaRecorder: ready
- Recording status: ready

**Step Type**: Stream processing & buffering

**Result States**:
1. Success:
   - audioBlob: Raw audio data
   - duration: Recording length
   - recordingStatus: completed
2. Error - Recording Too Short:
   - Error message: "Recording too short"
   - recordingStatus: failed
3. Error - Audio Stream Error:
   - Error message: "Recording failed"
   - recordingStatus: failed

### 3. Frontend Audio Processing
**Initial State**:
- audioBlob: Raw audio data
- AudioBuffer: not initialized

**Step Type**: Audio signal preprocessing

**Result States**:
1. Success:
   - processedAudioBuffer: Normalized audio data
   - waveformData: Visualization data
   - audioQuality: Signal quality metrics
2. Error - Invalid Audio Data:
   - Error message: "Invalid audio data"
   - processingStatus: failed
3. Error - Signal Too Weak:
   - Error message: "Audio signal too weak"
   - processingStatus: failed

### 4. Backend Feature Extraction
**Initial State**:
- processedAudioBuffer: Normalized audio data
- featureCache: Previous features (if any)

**Step Type**: Signal processing & feature extraction

**Result States**:
1. Success:
   - frequencySpectrum: FFT results
   - amplitudeEnvelope: Amplitude data
   - fundamentalFrequency: Base frequency
   - spectralFeatures: {centroid, rms, etc}
2. Error - Processing Failed:
   - Error message: "Feature extraction failed"
   - processingStatus: failed

### 5. Target Comparison
**Initial State**:
- extractedFeatures: Current features
- targetFeatures: From PostgreSQL
- acceptableRanges: From configuration

**Step Type**: Mathematical comparison & scoring

**Result States**:
1. Success:
   - similarityScore: 0-100%
   - featureDeltas: Difference metrics
   - matchStatus: {matched, close, different}
2. Error - Invalid Target Data:
   - Error message: "Target comparison failed"
   - comparisonStatus: failed

### 6. Feedback Generation
**Initial State**:
- similarityScore: Comparison result
- featureDeltas: Difference metrics
- feedbackRules: From configuration

**Step Type**: Rule-based analysis & message generation

**Result States**:
1. Success:
   - feedbackMessages: Array of feedback strings
   - improvementSuggestions: Array of suggestions
   - visualizationData: Comparison graphs data
2. Error - Rule Processing Failed:
   - Error message: "Feedback generation failed"
   - fallbackMessage: Generic feedback

### 7. Results Storage
**Initial State**:
- attemptData: {
  similarityScore,
  feedbackMessages,
  timestamp,
  audioReference
}

**Step Type**: Database transaction

**Result States**:
1. Success:
   - PostgreSQL: Updated with attempt data
   - IndexedDB: Updated with local reference
   - storageStatus: completed
2. Error - Database Error:
   - Error message: "Storage failed"
   - storageStatus: failed
   - recoveryAction: Local backup

## Error Recovery Flows

### Audio Permission Recovery
If Step 1 fails with permission denied:
1. Show permission instructions
2. Offer alternative input method
3. Retry permission request

### Signal Quality Recovery
If Step 3 fails with weak signal:
1. Adjust gain settings
2. Show recording tips
3. Offer retry with new settings

### Storage Recovery
If Step 7 fails:
1. Store in IndexedDB
2. Queue for later sync
3. Notify user of offline mode 