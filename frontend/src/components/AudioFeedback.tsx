import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { FrequencyFeatures, AmplitudeFeatures } from '../types/audio';

interface AudioFeedbackProps {
  frequencyFeatures: FrequencyFeatures;
  amplitudeFeatures: AmplitudeFeatures;
  similarityScore?: number;
}

export const AudioFeedback: React.FC<AudioFeedbackProps> = ({
  frequencyFeatures,
  amplitudeFeatures,
  similarityScore,
}) => {
  const getFeedbackMessage = () => {
    if (similarityScore === undefined || similarityScore === null) {
      return 'Recording analyzed. No similarity score available.';
    }
    
    if (similarityScore > 90) {
      return 'Excellent pronunciation! Keep it up!';
    } else if (similarityScore > 70) {
      return 'Good attempt! Try to match the target sound more closely.';
    } else if (similarityScore > 50) {
      return 'Keep practicing! Focus on matching the sound pattern.';
    } else {
      return 'Try again! Listen carefully to the target sound.';
    }
  };

  const getTechnicalFeedback = () => {
    const feedback = [];
    
    if (frequencyFeatures.fundamental < 50) {
      feedback.push('Try to speak with more voice.');
    }
    
    if (amplitudeFeatures.rms < 0.1) {
      feedback.push('Speak a bit louder.');
    } else if (amplitudeFeatures.rms > 0.8) {
      feedback.push('Try speaking a bit softer.');
    }
    
    return feedback;
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Feedback
      </Typography>
      
      {similarityScore !== undefined && similarityScore !== null && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Similarity Score
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={similarityScore} 
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {similarityScore.toFixed(1)}%
          </Typography>
        </Box>
      )}
      
      <Typography variant="body1" gutterBottom>
        {getFeedbackMessage()}
      </Typography>
      
      {getTechnicalFeedback().map((feedback, index) => (
        <Typography 
          key={index} 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          • {feedback}
        </Typography>
      ))}
    </Box>
  );
}; 