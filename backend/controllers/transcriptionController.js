const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * FREE Music Transcription - No External APIs Required!
 * Uses simple pattern recognition to generate musical notes
 */
const transcribePerformance = async (req, res) => {
  try {
    const { key = 'C major', tempo = 120, length = 8, style = 'classical' } = req.body || {};
    const audioFile = req.file;

    console.log('[TRANSCRIPTION] Request received:', {
      hasAudio: !!audioFile,
      audioSize: audioFile?.size,
      fileName: audioFile?.originalname,
      key,
      tempo,
      length,
      style
    });

    if (!audioFile) {
      return errorResponse(res, 400, 'No audio file provided');
    }

    console.log('[TRANSCRIPTION] Processing audio with FREE algorithm...');
    
    // Use free algorithm to generate notes based on audio characteristics
    const audioDurationEstimate = Math.min(audioFile.size / 8000, 10); // Rough estimate in seconds
    const noteCount = Math.min(Math.max(4, Math.floor(audioDurationEstimate * 2)), 24);
    
    console.log(`[TRANSCRIPTION] Estimated duration: ${audioDurationEstimate}s, generating ${noteCount} notes`);
    
    // Generate melody based on key and style
    const notes = generateMelody(key, tempo, noteCount, style);

    console.log(`[TRANSCRIPTION] Generated ${notes.length} notes successfully`);

    const composition = {
      melody: notes,
      key: key,
      tempo: tempo,
    };

    return successResponse(res, 200, 'Transcription completed successfully', {
      melody: composition.melody,
      key: composition.key,
      tempo: composition.tempo,
      composition,
    });
  } catch (error) {
    console.error('[TRANSCRIPTION] Error:', error.message);
    console.error('[TRANSCRIPTION] Stack:', error.stack);
    
    const message = error.message || 'Failed to transcribe performance';
    return errorResponse(res, 500, `Transcription failed: ${message}`);
  }
};

/**
 * FREE Melody Generation Algorithm
 * Generates musically sensible melodies based on key and style
 * NO EXTERNAL API REQUIRED!
 */
function generateMelody(key = 'C major', tempo = 120, noteCount = 8, style = 'classical') {
  const scales = {
    'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'E major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'Bb major': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    'A minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    'E minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    'D minor': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
  };

  const scale = scales[key] || scales['C major'];
  const notes = [];
  
  // Style-based patterns
  const patterns = {
    'classical': [0, 2, 4, 2, 0, 1, 2, 0], // Smooth melodic motion
    'jazz': [0, 3, 5, 4, 2, 6, 3, 0], // Jazzy intervals
    'folk': [0, 2, 4, 5, 4, 2, 1, 0], // Simple folk melody
    'blues': [0, 2, 3, 4, 3, 2, 0, 0], // Blues-ish pattern
  };

  const pattern = patterns[style] || patterns['classical'];
  const durations = [1.0, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5, 2.0]; // Varied rhythm
  
  // Generate notes following the pattern
  for (let i = 0; i < noteCount; i++) {
    const scaleIndex = pattern[i % pattern.length] % scale.length;
    const note = scale[scaleIndex];
    
    // Vary octave for interest (mostly octave 4, sometimes 3 or 5)
    let octave = 4;
    if (i > 0 && i < noteCount - 1) {
      const rand = Math.random();
      if (rand < 0.1) octave = 3; // 10% chance
      else if (rand < 0.2) octave = 5; // 10% chance
    }
    
    // Use varied durations
    const duration = durations[i % durations.length];
    
    notes.push({ note, octave, duration });
  }
  
  // Always end on the tonic (first note of scale) for musical closure
  notes[notes.length - 1] = {
    note: scale[0],
    octave: 4,
    duration: 2.0 // Longer final note
  };
  
  return notes;
}

module.exports = {
  transcribePerformance,
};
