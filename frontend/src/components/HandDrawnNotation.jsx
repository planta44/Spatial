import React, { useState, useRef, useEffect } from 'react';
import { Play, Save, Undo, Trash2, Music } from 'lucide-react';
import Vex from 'vexflow';

const HandDrawnNotation = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Note mapping for drawing (simplified for hand-drawn input)
  const notePositions = [
    { name: 'C', octave: 5, y: 50 },
    { name: 'B', octave: 4, y: 65 },
    { name: 'A', octave: 4, y: 80 },
    { name: 'G', octave: 4, y: 95 },
    { name: 'F', octave: 4, y: 110 },
    { name: 'E', octave: 4, y: 125 },
    { name: 'D', octave: 4, y: 140 },
    { name: 'C', octave: 4, y: 155 },
  ];

  // Draw staff and notes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw staff lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 100 + i * 15;
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }

    // Draw treble clef (simplified)
    ctx.font = '48px serif';
    ctx.fillStyle = '#333';
    ctx.fillText('𝄞', 25, 135);

    // Draw notes
    notes.forEach((note, index) => {
      const x = 80 + index * 60;
      const y = note.y;

      // Draw note head
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 6, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw stem
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 7, y);
      ctx.lineTo(x + 7, y - 35);
      ctx.stroke();

      // Draw note name below
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText(`${note.name}${note.octave}`, x - 10, y + 25);
    });
  }, [notes]);

  // Handle canvas click to add notes
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Find closest note position
    const closestNote = notePositions.reduce((prev, curr) =>
      Math.abs(curr.y - y) < Math.abs(prev.y - y) ? curr : prev
    );

    setNotes([...notes, { ...closestNote, duration: 1.0 }]);
  };

  // Undo last note
  const handleUndo = () => {
    setNotes(notes.slice(0, -1));
  };

  // Clear all notes
  const handleClear = () => {
    setNotes([]);
  };

  // Play notes using Web Audio API
  const playNotes = async () => {
    if (notes.length === 0 || isPlaying) return;

    setIsPlaying(true);
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    notes.forEach((note, index) => {
      const frequency = 440 * Math.pow(2, (noteToMidi(note) - 69) / 12);
      const startTime = now + index * 0.5;

      // Create oscillator
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });

    setTimeout(() => setIsPlaying(false), notes.length * 500 + 500);
  };

  // Convert note to MIDI number
  const noteToMidi = (note) => {
    const noteMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    return noteMap[note.name] + (note.octave + 1) * 12;
  };

  // Save composition
  const handleSave = () => {
    if (notes.length === 0) {
      alert('Please draw some notes first!');
      return;
    }

    const composition = {
      melody: notes.map(n => ({ note: n.name, octave: n.octave, duration: n.duration })),
      key: 'C major',
      tempo: 120,
    };

    if (onSave) {
      onSave(composition);
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Music className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to Draw Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Click on the staff to place notes (higher = higher pitch)</li>
              <li>Notes will snap to the nearest line/space</li>
              <li>Use Undo to remove the last note</li>
              <li>Click Play to hear your melody</li>
              <li>Save to load into the editor</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          onClick={handleCanvasClick}
          className="cursor-crosshair w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={playNotes}
          disabled={notes.length === 0 || isPlaying}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            notes.length === 0 || isPlaying
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <Play size={16} />
          {isPlaying ? 'Playing...' : 'Play Notes'}
        </button>

        <button
          onClick={handleUndo}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            notes.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
          }`}
        >
          <Undo size={16} />
          Undo
        </button>

        <button
          onClick={handleClear}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            notes.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <Trash2 size={16} />
          Clear All
        </button>

        <button
          onClick={handleSave}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ml-auto ${
            notes.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save size={16} />
          Save to Composer
        </button>
      </div>

      {/* Note count */}
      {notes.length > 0 && (
        <p className="text-sm text-gray-600">
          {notes.length} note{notes.length !== 1 ? 's' : ''} drawn
        </p>
      )}
    </div>
  );
};

export default HandDrawnNotation;
