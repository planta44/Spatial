import { useEffect, useRef } from 'react';

const AudioVisualizer = ({ waveformData = [], frequencyData = [] }) => {
  const waveformCanvasRef = useRef(null);
  const frequencyCanvasRef = useRef(null);

  useEffect(() => {
    if (waveformData.length === 0) return;

    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / waveformData.length;
    let x = 0;

    waveformData.forEach((value, i) => {
      const y = ((value + 1) / 2) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    });

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [waveformData]);

  useEffect(() => {
    if (frequencyData.length === 0) return;

    const canvas = frequencyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / frequencyData.length;

    frequencyData.forEach((value, i) => {
      const barHeight = (value / 255) * height;
      const hue = (i / frequencyData.length) * 360;

      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    });
  }, [frequencyData]);

  return (
    <div className="space-y-4">
      {/* Waveform */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white text-sm font-medium mb-2">Waveform</h3>
        <canvas
          ref={waveformCanvasRef}
          width={800}
          height={150}
          className="w-full rounded"
        />
      </div>

      {/* Frequency Spectrum */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white text-sm font-medium mb-2">Frequency Spectrum</h3>
        <canvas
          ref={frequencyCanvasRef}
          width={800}
          height={150}
          className="w-full rounded"
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;