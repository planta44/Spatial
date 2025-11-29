const axios = require('axios');

class AICompositionService {
  constructor() {
    // Music theory constants
    this.scales = {
      'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
      'A major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
      'E major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
      'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
      'Bb major': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
      'Eb major': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
      'Ab major': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']
    };
    
    this.chordProgressions = {
      'classical': ['I', 'vi', 'IV', 'V'],
      'pop': ['vi', 'IV', 'I', 'V'],
      'jazz': ['ii', 'V', 'I', 'vi'],
      'blues': ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V']
    };
  }

  // Rule-based melody generation
  generateMelody(params) {
    const { key = 'C major', length = 8, style = 'classical', complexity = 'beginner' } = params;
    const scale = this.scales[key] || this.scales['C major'];
    const melody = [];
    
    // Generate melody based on complexity
    const noteRange = complexity === 'beginner' ? 5 : complexity === 'intermediate' ? 7 : 12;
    
    // Prefer stepwise motion; limit large jumps
    let lastNoteIndex = 0;
    for (let i = 0; i < length; i++) {
      let noteIndex;
      if (i === 0 || i === length - 1) {
        // Start and end on tonic
        noteIndex = 0;
      } else {
        // 70% stepwise, 30% small jump
        const stepProbability = 0.7;
        if (Math.random() < stepProbability) {
          // Stepwise motion
          const direction = Math.random() < 0.5 ? -1 : 1;
          noteIndex = Math.max(0, Math.min(scale.length - 1, lastNoteIndex + direction));
        } else {
          // Small jump (2–3 steps)
          const jump = Math.random() < 0.5 ? 2 : 3;
          const direction = Math.random() < 0.5 ? -1 : 1;
          noteIndex = Math.max(0, Math.min(scale.length - 1, lastNoteIndex + direction * jump));
        }
        // Keep within range
        noteIndex = Math.min(noteIndex, noteRange - 1);
      }
      
      lastNoteIndex = noteIndex;
      melody.push({
        note: scale[noteIndex],
        noteIndex: noteIndex,
        duration: this.getRandomDuration(style),
        octave: 4
      });
    }
    
    return {
      melody,
      key,
      timeSignature: '4/4',
      tempo: params.tempo || 120,
      generatedAt: new Date()
    };
  }

  // Chord progression generation
  generateChords(params) {
    const { key = 'C major', progression = 'classical', length = 4 } = params;
    const scale = this.scales[key] || this.scales['C major'];
    const pattern = this.chordProgressions[progression] || this.chordProgressions['classical'];
    
    const chords = [];
    for (let i = 0; i < length; i++) {
      const romanNumeral = pattern[i % pattern.length];
      const chord = this.romanNumeralToChord(romanNumeral, scale);
      chords.push({
        romanNumeral,
        notes: chord,
        duration: 1 // whole note
      });
    }
    
    return {
      chords,
      key,
      progression,
      generatedAt: new Date()
    };
  }

  // Harmony suggestion for uploaded melody
  suggestHarmony(melody, key = 'C major') {
    const scale = this.scales[key] || this.scales['C major'];
    const suggestions = [];
    
    melody.forEach((note, index) => {
      // Find note position in scale
      const notePosition = scale.indexOf(note.note);
      
      // Suggest triads based on note
      const harmonies = [
        this.buildTriad(notePosition, scale),
        this.buildTriad((notePosition + 2) % scale.length, scale),
        this.buildTriad((notePosition + 4) % scale.length, scale)
      ];
      
      suggestions.push({
        melodyNote: note,
        suggestedChords: harmonies,
        confidence: this.calculateHarmonyConfidence(note, harmonies)
      });
    });
    
    return {
      suggestions,
      key,
      analysisType: 'harmonic_suggestion'
    };
  }

  // Convert melody to MusicXML format
  toMusicXML(composition) {
    const { melody, key, timeSignature, tempo } = composition;
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Melody</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>${this.getKeyFifths(key)}</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
      </direction>`;

    melody.forEach((note, index) => {
      xml += `
      <note>
        <pitch>
          <step>${note.note.charAt(0)}</step>
          ${note.note.includes('#') ? '<alter>1</alter>' : ''}
          ${note.note.includes('b') ? '<alter>-1</alter>' : ''}
          <octave>${note.octave}</octave>
        </pitch>
        <duration>${note.duration * 4}</duration>
        <type>${this.durationToNoteType(note.duration)}</type>
      </note>`;
    });

    xml += `
    </measure>
  </part>
</score-partwise>`;

    return xml;
  }

  // Helper methods
  getRandomDuration(style) {
    const durations = style === 'classical' 
      ? [0.5, 1, 1.5, 2] 
      : [0.25, 0.5, 1, 1];
    return durations[Math.floor(Math.random() * durations.length)];
  }

  romanNumeralToChord(romanNumeral, scale) {
    const numeralMap = { 'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii': 6 };
    const root = numeralMap[romanNumeral] || 0;
    return this.buildTriad(root, scale);
  }

  buildTriad(root, scale) {
    return [
      scale[root],
      scale[(root + 2) % scale.length],
      scale[(root + 4) % scale.length]
    ];
  }

  calculateHarmonyConfidence(note, harmonies) {
    // Simple confidence calculation
    return Math.random() * 0.3 + 0.7; // 70-100%
  }

  getKeyFifths(key) {
    const fifths = {
      'C major': 0, 'G major': 1, 'D major': 2, 'A major': 3, 'E major': 4,
      'F major': -1, 'Bb major': -2, 'Eb major': -3, 'Ab major': -4
    };
    return fifths[key] || 0;
  }

  durationToNoteType(duration) {
    if (duration <= 0.25) return 'sixteenth';
    if (duration <= 0.5) return 'eighth';
    if (duration <= 1) return 'quarter';
    if (duration <= 2) return 'half';
    return 'whole';
  }
}

module.exports = new AICompositionService();
