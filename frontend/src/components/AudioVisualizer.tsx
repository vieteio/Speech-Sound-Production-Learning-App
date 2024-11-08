import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FrequencyFeatures, AmplitudeFeatures } from '../types/audio';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AudioVisualizerProps {
  frequencyFeatures: FrequencyFeatures;
  amplitudeFeatures: AmplitudeFeatures;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  frequencyFeatures,
  amplitudeFeatures,
}) => {
  const frequencyData = {
    labels: frequencyFeatures.spectrum.map((_: number, i: number) => i.toString()),
    datasets: [
      {
        label: 'Frequency Spectrum',
        data: frequencyFeatures.spectrum,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const amplitudeData = {
    labels: amplitudeFeatures.envelope.map((_: number, i: number) => i.toString()),
    datasets: [
      {
        label: 'Amplitude Envelope',
        data: amplitudeFeatures.envelope,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Audio Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3>Frequency Analysis</h3>
        <Line data={frequencyData} options={options} />
      </div>
      <div>
        <h3>Amplitude Analysis</h3>
        <Line data={amplitudeData} options={options} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <p>Fundamental Frequency: {frequencyFeatures.fundamental.toFixed(2)} Hz</p>
        <p>Spectral Centroid: {frequencyFeatures.centroid.toFixed(2)} Hz</p>
        <p>RMS Energy: {amplitudeFeatures.rms.toFixed(2)}</p>
      </div>
    </div>
  );
}; 