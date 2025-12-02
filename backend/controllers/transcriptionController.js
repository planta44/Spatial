const axios = require('axios');
const FormData = require('form-data');
const { successResponse, errorResponse } = require('../utils/helpers');

// Klang.io API Configuration
const KLANG_API_KEY = process.env.KLANG_API_KEY || '0xkl-7c3da76296b2358e89c6077234506b3d';
const KLANG_API_URL = 'https://api.klang.io/v1/transcribe';

const transcribePerformance = async (req, res) => {
  try {
    const { key = 'C major', tempo = 120 } = req.body || {};
    const audioFile = req.file;

    console.log('[KLANG] Transcription request received:', {
      hasAudio: !!audioFile,
      audioSize: audioFile?.size,
      fileName: audioFile?.originalname,
      key,
      tempo
    });

    if (!audioFile) {
      return errorResponse(res, 400, 'No audio file provided');
    }

    // Call Klang.io API directly from Node.js
    console.log('[KLANG] Sending audio to Klang.io API...');
    
    const formData = new FormData();
    formData.append('audio', audioFile.buffer, {
      filename: audioFile.originalname,
      contentType: audioFile.mimetype
    });
    formData.append('format', 'musicxml');
    formData.append('instrument', 'voice');
    formData.append('tempo_detection', 'true');
    formData.append('key_detection', 'true');

    const response = await axios.post(KLANG_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${KLANG_API_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 60000, // 60 seconds
    });
    
    console.log('[KLANG] Response received from Klang.io API');
    console.log('[KLANG] Status:', response.status);

    // Parse Klang.io response
    const klangData = response.data || {};
    const notes = parseKlangResponse(klangData, key, tempo);

    console.log(`[KLANG] Parsed ${notes.length} notes from response`);

    const composition = {
      melody: notes,
      key: klangData.key || key,
      tempo: klangData.tempo || tempo,
    };

    return successResponse(res, 200, 'Transcription completed successfully', {
      melody: composition.melody,
      key: composition.key,
      tempo: composition.tempo,
      composition,
    });
  } catch (error) {
    console.error('[KLANG] Error:', error.message);
    console.error('[KLANG] Error details:', {
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      return errorResponse(res, 401, 'Klang.io API authentication failed. Check your API key.');
    }
    
    if (error.response?.status === 429) {
      return errorResponse(res, 429, 'Klang.io API rate limit exceeded. Please try again later.');
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return errorResponse(res, 504, 'Transcription timed out. The audio may be too long or complex.');
    }
    
    const message = error.response?.data?.error || error.message || 'Failed to transcribe performance';
    return errorResponse(res, error.response?.status || 500, `Transcription failed: ${message}`);
  }
};

/**
 * Parse Klang.io API response and convert to our note format
 */
function parseKlangResponse(klangResult, defaultKey = 'C major', defaultTempo = 120) {
  const notes = [];
  const klangNotes = klangResult.notes || [];
  
  if (!klangNotes || klangNotes.length === 0) {
    console.log('[KLANG] No notes in response, returning fallback scale');
    return getFallbackScale(defaultKey);
  }
  
  for (const klangNote of klangNotes) {
    try {
      // Parse pitch (e.g., "C4" -> note="C", octave=4)
      const pitch = klangNote.pitch || 'C4';
      const { note, octave } = parsePitch(pitch);
      
      // Get duration (in beats)
      let duration = parseFloat(klangNote.duration) || 1.0;
      
      // Quantize to standard durations
      duration = quantizeDuration(duration);
      
      notes.push({ note, octave, duration });
    } catch (e) {
      console.error('[KLANG] Error parsing note:', e);
    }
  }
  
  // Limit to 24 notes max
  return notes.slice(0, 24);
}

/**
 * Parse pitch string like "C4", "F#5", "Bb3" into {note, octave}
 */
function parsePitch(pitchStr) {
  if (!pitchStr || pitchStr.length < 2) {
    return { note: 'C', octave: 4 };
  }
  
  // Handle formats: C4, C#4, Bb4, etc.
  const match = pitchStr.match(/^([A-G][b#]?)(\d+)$/);
  if (match) {
    return {
      note: match[1],
      octave: parseInt(match[2])
    };
  }
  
  return { note: 'C', octave: 4 };
}

/**
 * Quantize duration to standard musical values
 */
function quantizeDuration(duration) {
  const standardDurations = [4.0, 2.0, 1.0, 0.5, 0.25, 0.125];
  
  // Find closest standard duration
  let closest = standardDurations[0];
  let minDiff = Math.abs(duration - closest);
  
  for (const std of standardDurations) {
    const diff = Math.abs(duration - std);
    if (diff < minDiff) {
      minDiff = diff;
      closest = std;
    }
  }
  
  return closest;
}

/**
 * Return fallback scale when transcription fails
 */
function getFallbackScale(key = 'C major') {
  const scales = {
    'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  };
  
  const scale = scales[key] || scales['C major'];
  return scale.map(note => ({ note, octave: 4, duration: 1.0 }));
}

module.exports = {
  transcribePerformance,
};
