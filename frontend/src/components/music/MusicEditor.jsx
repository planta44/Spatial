import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Download, Save, Trash2, Wand2, Undo } from 'lucide-react';

const MusicEditor = ({ composition, onSave, onPlay, onStop, isPlaying }) => {
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [scale, setScale] = useState('C major');
  const [tempo, setTempo] = useState(120);
  const [audioContext, setAudioContext] = useState(null);
  const [currentOscillator, setCurrentOscillator] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Music theory data
  const scales = {
    'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']
  };

  const noteFrequencies = {
    'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
    'G': 392.00, 'A': 440.00, 'B': 493.88,
    'F#': 369.99, 'Bb': 466.16, 'C#': 277.18
  };

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(ctx);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    initAudio();
  }, []);

  // Load composition data
  useEffect(() => {
    if (composition && composition.melody) {
      setNotes(composition.melody);
      setScale(composition.key || 'C major');
      setTempo(composition.tempo || 120);
      // Initialize history with loaded composition
      setHistory([composition.melody]);
      setHistoryIndex(0);
    }
  }, [composition]);

  // Add to history when notes change
  const addToHistory = (newNotes) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newNotes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousIndex = historyIndex - 1;
      setHistoryIndex(previousIndex);
      setNotes([...history[previousIndex]]);
    }
  };

  // Draw staff and notes
  useEffect(() => {
    drawStaff();
  }, [notes, selectedNote, scale]);

  const drawStaff = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw staff lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    const staffY = height / 2 - 50;
    const lineSpacing = 20;
    
    // Five staff lines
    for (let i = 0; i < 5; i++) {
      const y = staffY + i * lineSpacing;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 50, y);
      ctx.stroke();
    }

    // Draw treble clef (simplified symbol)
    ctx.font = '48px serif';
    ctx.fillStyle = '#000000';
    ctx.fillText('♪', 60, staffY + 65);

    // Draw time signature
    ctx.font = '20px Arial';
    ctx.fillText('4', 110, staffY + 25);
    ctx.fillText('4', 110, staffY + 55);

    // Draw key signature
    ctx.font = '14px Arial';
    ctx.fillText(scale, 140, staffY - 10);

    // Draw notes
    notes.forEach((note, index) => {
      drawNote(ctx, note, index, staffY, lineSpacing);
    });

    // Draw cursor line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    const cursorX = 200 + notes.length * 60;
    ctx.beginPath();
    ctx.moveTo(cursorX, staffY - 20);
    ctx.lineTo(cursorX, staffY + 100);
    ctx.stroke();
  };

  const drawNote = (ctx, note, index, staffY, lineSpacing) => {
    const noteX = 200 + index * 60;
    const noteY = calculateNoteY(note.note, staffY, lineSpacing);
    
    // Highlight selected note
    if (selectedNote === index) {
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = '#3b82f6';
    } else {
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
    }

    // Draw note head (filled oval)
    ctx.save();
    ctx.translate(noteX, noteY);
    ctx.rotate(Math.PI / 6); // Slight rotation for musical note appearance
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw stem
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(noteX + 7, noteY);
    ctx.lineTo(noteX + 7, noteY - 35);
    ctx.stroke();

    // Draw note name below
    ctx.font = '10px Arial';
    ctx.fillStyle = selectedNote === index ? '#3b82f6' : '#666666';
    ctx.textAlign = 'center';
    ctx.fillText(note.note, noteX, noteY + 50);

    // Draw ledger lines if needed
    drawLedgerLines(ctx, noteX, noteY, staffY);
  };

  const calculateNoteY = (noteName, staffY, lineSpacing) => {
    const notePositions = {
      'B': staffY - lineSpacing,     // Above staff
      'A': staffY,                   // Top line
      'G': staffY + lineSpacing,     // 4th line
      'F': staffY + lineSpacing * 2, // 3rd line  
      'E': staffY + lineSpacing * 3, // 2nd line
      'D': staffY + lineSpacing * 4, // Bottom line
      'C': staffY + lineSpacing * 5, // Below staff
      'F#': staffY + lineSpacing * 2,
      'Bb': staffY - lineSpacing / 2,
      'C#': staffY + lineSpacing * 4.5
    };
    return notePositions[noteName] || staffY + lineSpacing * 2;
  };

  const drawLedgerLines = (ctx, noteX, noteY, staffY) => {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    // Draw ledger line above staff
    if (noteY < staffY - 10) {
      ctx.beginPath();
      ctx.moveTo(noteX - 12, staffY - 20);
      ctx.lineTo(noteX + 12, staffY - 20);
      ctx.stroke();
    }
    
    // Draw ledger line below staff
    if (noteY > staffY + 90) {
      ctx.beginPath();
      ctx.moveTo(noteX - 12, staffY + 100);
      ctx.lineTo(noteX + 12, staffY + 100);
      ctx.stroke();
    }
  };

  // Handle canvas clicks
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on existing note
    const clickedNoteIndex = findNoteAtPosition(x, y);
    if (clickedNoteIndex !== -1) {
      setSelectedNote(clickedNoteIndex);
      playNote(notes[clickedNoteIndex]);
    } else if (x > 180) {
      // Add new note
      addNoteAtPosition(x, y);
    }
  };

  const findNoteAtPosition = (x, y) => {
    return notes.findIndex((note, index) => {
      const noteX = 200 + index * 60;
      const noteY = calculateNoteY(note.note, canvasRef.current.height / 2 - 50, 20);
      return Math.abs(x - noteX) < 25 && Math.abs(y - noteY) < 15;
    });
  };

  const addNoteAtPosition = (x, y) => {
    const staffY = canvasRef.current.height / 2 - 50;
    const lineSpacing = 20;
    
    // Determine which note based on Y position
    const relativeY = y - staffY;
    const lineIndex = Math.round(relativeY / lineSpacing);
    
    const scaleNotes = scales[scale];
    let noteIndex = Math.max(0, Math.min(scaleNotes.length - 1, 6 - lineIndex));
    
    const newNote = {
      note: scaleNotes[noteIndex],
      duration: 1,
      octave: 4
    };

    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    addToHistory(newNotes);
    playNote(newNote);
  };

  // Play individual note
  const playNote = async (note) => {
    if (!audioContext) return;

    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Stop previous note
      if (currentOscillator) {
        currentOscillator.stop();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(
        noteFrequencies[note.note] || 440, 
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);

      setCurrentOscillator(oscillator);
    } catch (error) {
      console.error('Error playing note:', error);
    }
  };

  // Play entire composition
  const handlePlayComposition = async () => {
    if (!audioContext || notes.length === 0) {
      alert('No notes to play!');
      return;
    }

    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const noteDuration = 60 / tempo; // Duration per beat
      
      notes.forEach((note, index) => {
        const startTime = audioContext.currentTime + (index * noteDuration);
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(
          noteFrequencies[note.note] || 440, 
          startTime
        );

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration - 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration);
      });

      onPlay && onPlay();
    } catch (error) {
      console.error('Error playing composition:', error);
      alert('Error playing composition. Try again.');
    }
  };

  const generateRandomMelody = () => {
    const scaleNotes = scales[scale];
    const newNotes = [];
    
    for (let i = 0; i < 8; i++) {
      // Add some musical logic for better melodies
      let noteIndex;
      if (i === 0 || i === 7) {
        noteIndex = 0; // Start and end on tonic
      } else {
        // Prefer stepwise motion
        const lastIndex = i > 0 ? scaleNotes.indexOf(newNotes[i-1].note) : 0;
        const stepDirection = Math.random() < 0.5 ? -1 : 1;
        noteIndex = Math.max(0, Math.min(scaleNotes.length - 1, lastIndex + stepDirection));
        
        // Sometimes add a leap
        if (Math.random() < 0.3) {
          noteIndex = Math.floor(Math.random() * scaleNotes.length);
        }
      }
      
      newNotes.push({
        note: scaleNotes[noteIndex],
        duration: Math.random() < 0.7 ? 1 : 0.5,
        octave: 4
      });
    }
    
    setNotes(newNotes);
  };

  const deleteSelectedNote = () => {
    if (selectedNote !== null) {
      setNotes(prev => prev.filter((_, index) => index !== selectedNote));
      setSelectedNote(null);
    }
  };

  const saveComposition = () => {
    try {
      const compositionData = {
        title: `Music Composition ${new Date().toLocaleString()}`,
        melody: notes,
        key: scale,
        tempo: tempo,
        timeSignature: '4/4',
        noteCount: notes.length,
        duration: notes.length * (60 / tempo),
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
      
      if (onSave) {
        onSave(compositionData);
      } else {
        // Download as JSON
        const dataStr = JSON.stringify(compositionData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `composition-${Date.now()}.json`);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        alert(`✅ Composition saved!\n\nNotes: ${notes.length}\nKey: ${scale}\nTempo: ${tempo} BPM\nDuration: ${Math.round(notes.length * (60 / tempo))}s`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Failed to save composition. Please try again.');
    }
  };

  const exportMIDI = () => {
    try {
      if (notes.length === 0) {
        alert('❌ No notes to export! Please add some notes first.');
        return;
      }

      // Create more detailed export data
      const exportData = {
        format: 'Spatial AI MIDI Export',
        metadata: {
          title: `Exported Melody ${new Date().toLocaleString()}`,
          composer: 'Spatial AI User',
          key: scale,
          tempo,
          timeSignature: '4/4',
          totalNotes: notes.length,
          duration: `${Math.round(notes.length * (60 / tempo))} seconds`,
          exportedAt: new Date().toISOString()
        },
        tracks: [{
          name: 'Main Melody',
          channel: 1,
          instrument: 'Piano',
          notes: notes.map((note, index) => ({
            pitch: note.note,
            octave: note.octave || 4,
            frequency: noteFrequencies[note.note] || 440,
            startTime: index * (60 / tempo), // seconds
            duration: note.duration * (60 / tempo), // seconds
            velocity: Math.round(127 * 0.8), // MIDI velocity (0-127)
            position: index + 1
          }))
        }],
        settings: {
          key: scale,
          tempo: tempo,
          timeSignature: '4/4'
        }
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `midi-export-${Date.now()}.json`);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      alert(`🎵 MIDI Export Complete!\n\nFile: midi-export-${Date.now()}.json\nNotes: ${notes.length}\nKey: ${scale}\nTempo: ${tempo} BPM`);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export MIDI. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Scale:</label>
          <select 
            value={scale} 
            onChange={(e) => setScale(e.target.value)}
            className="border rounded px-3 py-1 bg-white"
          >
            {Object.keys(scales).map(scaleName => (
              <option key={scaleName} value={scaleName}>{scaleName}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tempo:</label>
          <input 
            type="number" 
            value={tempo} 
            onChange={(e) => setTempo(Number(e.target.value))}
            className="border rounded px-3 py-1 w-20"
            min="60" 
            max="200"
          />
          <span className="text-xs text-gray-500">BPM</span>
        </div>
        
        <button
          onClick={generateRandomMelody}
          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          <Wand2 size={16} />
          AI Generate
        </button>
      </div>

      {/* Music Staff Canvas */}
      <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={250}
          className="w-full h-auto cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded">
        <p className="font-medium text-blue-800 mb-1">Instructions:</p>
        <ul className="text-blue-700 space-y-1">
          <li>• Click on the staff to add notes</li>
          <li>• Click existing notes to select and hear them</li>
          <li>• Use AI Generate to create random melodies</li>
          <li>• Adjust scale and tempo to change the music</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePlayComposition}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
            notes.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Play size={16} />
          Play All ({notes.length} notes)
        </button>
        
        <button
          onClick={saveComposition}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
            notes.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Save size={16} />
          Save
        </button>
        
        <button
          onClick={exportMIDI}
          disabled={notes.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium ${
            notes.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          <Download size={16} />
          Export
        </button>
        
        {selectedNote !== null && (
          <button
            onClick={deleteSelectedNote}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            <Trash2 size={16} />
            Delete Note
          </button>
        )}

        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            historyIndex <= 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <Undo size={16} />
          Undo Last Note
        </button>

        {notes.length > 0 && (
          <button
            onClick={() => {
              setNotes([]);
              addToHistory([]);
            }}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default MusicEditor;
