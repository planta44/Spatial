import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Save, Undo, Trash2, Music, Pencil, Plus, X } from 'lucide-react';

const HandDrawnNotation = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [allStrokes, setAllStrokes] = useState([]);
  const [staves, setStaves] = useState([0]); // Track multiple staff lines
  const audioContextRef = useRef(null);
  const canvasHeightRef = useRef(300);
  const playingNodesRef = useRef([]); // Store playing audio nodes for pause/stop

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Staff configuration
  const STAFF_HEIGHT = 220;
  const STAFF_TOP_MARGIN = 40;
  const LINE_SPACING = 15;
  
  // Note positions relative to each staff
  const getNotePositions = (staffIndex) => {
    const baseY = STAFF_TOP_MARGIN + staffIndex * STAFF_HEIGHT;
    return [
      { name: 'A', octave: 5, y: baseY + 20 },  // Above staff
      { name: 'G', octave: 5, y: baseY + 27.5 },
      { name: 'F', octave: 5, y: baseY + 35 },  // Top line
      { name: 'E', octave: 5, y: baseY + 42.5 },
      { name: 'D', octave: 5, y: baseY + 50 },  // 4th line
      { name: 'C', octave: 5, y: baseY + 57.5 },
      { name: 'B', octave: 4, y: baseY + 65 },  // 3rd line
      { name: 'A', octave: 4, y: baseY + 72.5 },
      { name: 'G', octave: 4, y: baseY + 80 },  // 2nd line
      { name: 'F', octave: 4, y: baseY + 87.5 },
      { name: 'E', octave: 4, y: baseY + 95 },  // 1st line
      { name: 'D', octave: 4, y: baseY + 102.5 },
      { name: 'C', octave: 4, y: baseY + 110 }, // Below staff
      { name: 'B', octave: 3, y: baseY + 117.5 },
      { name: 'A', octave: 3, y: baseY + 125 },
    ];
  };

  // Advanced shape recognition with better tolerance for human drawing
  const recognizeShape = (points) => {
    if (points.length < 3) return { type: 'unknown' };

    const bounds = {
      minX: Math.min(...points.map(p => p.x)),
      maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxY: Math.max(...points.map(p => p.y)),
    };

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const aspectRatio = height / Math.max(width, 1);

    // 1. Check for vertical stem (straight line)
    const isVerticalStem = aspectRatio > 2.5 && height > 25 && width < 15;
    if (isVerticalStem) {
      return {
        type: 'stem',
        center: { x: centerX, y: centerY },
        top: bounds.minY,
        bottom: bounds.maxY,
      };
    }

    // 2. Check for horizontal line (leger line or beam)
    const isHorizontalLine = width > height * 2.5 && width > 25 && height < 15;
    if (isHorizontalLine) {
      return { type: 'leger_line', center: { x: centerX, y: centerY } };
    }

    // 3. Calculate circularity with generous tolerance for human error
    const avgRadius = points.reduce((sum, p) => {
      const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
      return sum + dist;
    }, 0) / points.length;

    const deviations = points.map(p => {
      const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
      return Math.abs(dist - avgRadius);
    });

    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
    const circularityScore = 1 - (avgDeviation / avgRadius);
    
    // More forgiving circularity threshold (50% instead of 60%)
    const isReasonablyCircular = circularityScore > 0.5 && avgRadius > 5 && avgRadius < 40;

    // 4. Detect note type based on multiple factors
    if (isReasonablyCircular || (aspectRatio < 2 && aspectRatio > 0.5 && width < 40 && height < 40)) {
      // Calculate "density" - how much ink was used
      const perimeter = points.length;
      const area = width * height;
      const density = perimeter / Math.max(area, 1);

      // Check if it's closed (start and end points are close)
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const distStartEnd = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
      );
      const isClosed = distStartEnd < avgRadius * 0.6;

      // Determine note duration
      let noteType;
      if (width > 20 || height > 20) {
        // Larger shapes = half/whole notes (hollow)
        noteType = 'hollow_note';
      } else if (density > 0.8 || !isClosed) {
        // High density or not closed = filled note
        noteType = 'filled_note';
      } else {
        // Default to filled quarter note
        noteType = 'filled_note';
      }

      return {
        type: noteType,
        center: { x: centerX, y: centerY },
        radius: avgRadius,
        confidence: circularityScore,
      };
    }

    // 5. Check for dot (very small circle)
    if (width < 12 && height < 12 && width > 3 && height > 3) {
      return {
        type: 'dot',
        center: { x: centerX, y: centerY },
      };
    }

    // 6. Try to salvage as a note even if not perfectly circular
    if (width < 50 && height < 50 && width > 5 && height > 5) {
      return {
        type: 'filled_note',
        center: { x: centerX, y: centerY },
        radius: (width + height) / 4,
        confidence: 0.3, // Low confidence
      };
    }

    return { type: 'unknown', center: { x: centerX, y: centerY } };
  };

  // Update canvas height based on number of staves
  useEffect(() => {
    const requiredHeight = STAFF_TOP_MARGIN + staves.length * STAFF_HEIGHT + 50;
    canvasHeightRef.current = Math.max(300, requiredHeight);
  }, [staves]);

  // Draw staff and notes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update canvas height dynamically
    canvas.height = canvasHeightRef.current;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all staves
    staves.forEach((staffIndex) => {
      const baseY = STAFF_TOP_MARGIN + staffIndex * STAFF_HEIGHT;
      
      // Draw 5 staff lines
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = baseY + 35 + i * LINE_SPACING;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
      }

      // Draw treble clef
      ctx.font = '40px serif';
      ctx.fillStyle = '#333';
      ctx.fillText('𝄞', 25, baseY + 75);
      
      // Draw bar line at start
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(70, baseY + 35);
      ctx.lineTo(70, baseY + 95);
      ctx.stroke();
    });

    // Draw all strokes (user's raw drawings)
    allStrokes.forEach(stroke => {
      if (stroke.recognized) return; // Skip recognized strokes
      
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      stroke.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });

    // Draw current stroke (while drawing)
    if (currentStroke.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      currentStroke.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }

    // Draw recognized notes
    notes.forEach((note) => {
      const x = note.x;
      const y = note.y;
      const duration = note.duration;

      // Draw note head
      if (duration >= 2.0) {
        // Whole note or half note (hollow)
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, 9, 7, Math.PI / 4, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        // Quarter note or shorter (filled)
        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.ellipse(x, y, 9, 7, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw stem for non-whole notes
      if (duration < 2.0) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2.5;
        const stemHeight = 45;
        const stemX = x + 8;
        ctx.beginPath();
        ctx.moveTo(stemX, y);
        ctx.lineTo(stemX, y - stemHeight);
        ctx.stroke();

        // Draw flag for eighth notes
        if (duration <= 0.5) {
          ctx.beginPath();
          ctx.arc(stemX, y - stemHeight + 5, 8, 0, Math.PI);
          ctx.stroke();
        }
      }

      // Draw note name
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#475569';
      const durationLabel = duration >= 2 ? '𝅝' : duration >= 1 ? '♩' : duration >= 0.5 ? '♪' : '𝅘𝅥𝅯';
      ctx.fillText(`${note.name}${note.octave} ${durationLabel}`, x - 12, y + 30);
    });
  }, [notes, currentStroke, allStrokes, staves]);

  // Get accurate canvas coordinates accounting for scaling
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return { x, y };
  };

  // Mouse/touch event handlers for drawing
  const startDrawing = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    setCurrentStroke(prev => [...prev, { x, y }]);
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStroke.length < 2) {
      setIsDrawing(false);
      setCurrentStroke([]);
      return;
    }
    setIsDrawing(false);

    // Recognize the shape with improved tolerance
    const shape = recognizeShape(currentStroke);
    
    if (shape.type === 'filled_note' || shape.type === 'hollow_note') {
      // Determine which staff this note belongs to
      const staffIndex = Math.floor((shape.center.y - STAFF_TOP_MARGIN) / STAFF_HEIGHT);
      const effectiveStaffIndex = Math.max(0, Math.min(staffIndex, staves.length - 1));
      
      // Find the closest note position on this staff
      const notePositions = getNotePositions(effectiveStaffIndex);
      const closestNote = notePositions.reduce((prev, curr) =>
        Math.abs(curr.y - shape.center.y) < Math.abs(prev.y - shape.center.y) ? curr : prev
      );
      
      // Determine duration based on shape type
      const duration = shape.type === 'hollow_note' ? 2.0 : 1.0;
      
      // Calculate x position (where on the staff horizontally)
      const x = shape.center.x;
      
      // Add note
      const newNote = {
        ...closestNote,
        x,
        duration,
        staffIndex: effectiveStaffIndex,
      };
      
      setNotes([...notes, newNote]);
      setAllStrokes([...allStrokes, { points: currentStroke, recognized: true }]);
      
      // Check if we need to add a new staff (if drawing near bottom)
      if (shape.center.y > canvasHeightRef.current - 100) {
        setStaves([...staves, staves.length]);
      }
    } else if (shape.type === 'stem') {
      // Try to attach stem to nearest note
      const nearbyNote = notes.find(n => 
        Math.abs(n.x - shape.center.x) < 25 && 
        Math.abs(n.y - shape.center.y) < 50
      );
      
      if (nearbyNote) {
        // Keep recognized but don't modify note (visual only)
        setAllStrokes([...allStrokes, { points: currentStroke, recognized: true }]);
      } else {
        setAllStrokes([...allStrokes, { points: currentStroke, recognized: false }]);
      }
    } else if (shape.type === 'dot') {
      // Dotted note - find nearest note and increase duration by 50%
      const nearbyNote = notes.find(n => 
        Math.abs(n.x - shape.center.x) < 30 && 
        Math.abs(n.y - shape.center.y) < 20
      );
      
      if (nearbyNote) {
        nearbyNote.duration = nearbyNote.duration * 1.5;
        setNotes([...notes]);
        setAllStrokes([...allStrokes, { points: currentStroke, recognized: true }]);
      } else {
        setAllStrokes([...allStrokes, { points: currentStroke, recognized: false }]);
      }
    } else {
      // Unrecognized shape, keep the stroke visible
      setAllStrokes([...allStrokes, { points: currentStroke, recognized: false }]);
    }
    
    setCurrentStroke([]);
  };

  // Undo last note
  const handleUndo = () => {
    setNotes(notes.slice(0, -1));
  };

  // Clear all notes
  const handleClear = () => {
    setNotes([]);
    setStrokes([]);
    setCurrentStroke([]);
  };

  // Play or pause notes
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause/stop all playing notes
      pauseNotes();
    } else {
      // Start playing
      playNotes();
    }
  };

  // Play notes using Web Audio API
  const playNotes = async () => {
    if (notes.length === 0) return;

    setIsPlaying(true);
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Clear any existing nodes
    playingNodesRef.current = [];

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

      // Store nodes for potential stopping
      playingNodesRef.current.push({ oscillator, gainNode });
    });

    setTimeout(() => {
      setIsPlaying(false);
      playingNodesRef.current = [];
    }, notes.length * 500 + 500);
  };

  // Pause/stop all playing notes
  const pauseNotes = () => {
    playingNodesRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        gainNode.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        oscillator.stop();
      } catch (e) {
        // Already stopped
      }
    });
    playingNodesRef.current = [];
    setIsPlaying(false);
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Pencil className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-2 text-base">✍️ Professional Handwritten Music Recognition</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="font-semibold text-xs mb-1">Drawing Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-blue-800">
                  <li><strong>Small filled circles</strong> = Quarter notes (♩)</li>
                  <li><strong>Large hollow circles</strong> = Half notes (𝅗𝅥)</li>
                  <li><strong>Vertical lines</strong> = Stems</li>
                  <li>Draw exactly where you want the note - no offset!</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-xs mb-1">Multi-Staff Support:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-blue-800">
                  <li>System auto-expands when drawing near bottom</li>
                  <li>Each staff holds a full range of notes</li>
                  <li>Perfect for longer compositions!</li>
                  <li>Undo, Play, or Save your masterpiece</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas - Scrollable for multi-staff */}
      <div className="border-2 border-gray-300 rounded-lg overflow-auto bg-white" style={{ maxHeight: '500px' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={canvasHeightRef.current}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair w-full"
        />
      </div>
      
      {/* Staff Management */}
      <div className="flex flex-wrap gap-2">
        {staves.length < 5 && (
          <button
            onClick={() => setStaves([...staves, staves.length])}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Add Staff ({staves.length}/5)
          </button>
        )}
        {staves.length > 1 && (
          <button
            onClick={() => {
              const newStaves = staves.slice(0, -1);
              const newNotes = notes.filter(n => n.staffIndex < newStaves.length);
              setStaves(newStaves);
              setNotes(newNotes);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <X size={16} />
            Delete Last Staff
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={togglePlayPause}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            notes.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isPlaying
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play All Notes'}
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

      {/* Note count and stats */}
      {notes.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <p className="text-gray-700 font-medium">
            📝 {notes.length} note{notes.length !== 1 ? 's' : ''} drawn
          </p>
          <p className="text-gray-600">
            📊 {staves.length} staff{staves.length !== 1 ? 'ves' : ''}
          </p>
          <p className="text-gray-600">
            {allStrokes.filter(s => !s.recognized).length > 0 && 
              `⚠️ ${allStrokes.filter(s => !s.recognized).length} unrecognized stroke${allStrokes.filter(s => !s.recognized).length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default HandDrawnNotation;
