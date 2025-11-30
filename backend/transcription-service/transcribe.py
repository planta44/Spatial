import librosa
import numpy as np

def load_audio(audio_path):
    """Load audio using librosa (handles multiple formats)."""
    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    return sr, y

def autocorr_pitch(y, sr, fmin=80.0, fmax=600.0):
    """Pitch detection using librosa's pYIN (best free option for monophonic vocals)."""
    # Use pYIN for monophonic pitch tracking
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y,
        sr=sr,
        fmin=fmin,
        fmax=fmax,
        frame_length=2048
    )
    
    # Get times for each frame
    times = librosa.frames_to_time(np.arange(len(f0)), sr=sr)
    
    # Filter out unvoiced frames and NaN values
    detected_pitches = []
    detected_times = []
    
    for i, (freq, is_voiced) in enumerate(zip(f0, voiced_flag)):
        if is_voiced and not np.isnan(freq):
            detected_pitches.append(freq)
            detected_times.append(times[i])
    
    return np.array(detected_pitches), np.array(detected_times)

def merge_and_limit_notes(notes, max_notes=16, min_duration=0.125, max_duration=2.0):
    """Merge consecutive identical notes, enforce min/max duration, and limit total count."""
    if not notes:
        return []
    merged = []
    prev = notes[0]
    for n in notes[1:]:
        if n['note'] == prev['note'] and n['octave'] == prev['octave']:
            # Merge: add durations, but cap at max
            prev['duration'] = min(prev['duration'] + n['duration'], max_duration)
        else:
            # Enforce minimum duration and cap maximum
            prev['duration'] = max(min_duration, min(prev['duration'], max_duration))
            merged.append(prev)
            prev = n
    # Enforce min/max duration on last note
    prev['duration'] = max(min_duration, min(prev['duration'], max_duration))
    merged.append(prev)

    # If still too many notes, simplify by merging shortest adjacent notes
    while len(merged) > max_notes:
        # Find the pair with the smallest combined duration
        min_idx = min(range(len(merged) - 1), key=lambda i: merged[i]['duration'] + merged[i+1]['duration'])
        # Merge them (but still cap)
        merged[min_idx]['duration'] = min(
            merged[min_idx]['duration'] + merged[min_idx + 1]['duration'],
            max_duration
        )
        merged.pop(min_idx + 1)

    return merged

def freq_to_midi(freq):
    """Convert frequency to nearest MIDI note number."""
    A4 = 440.0
    MIDI_A4 = 69
    if freq <= 0:
        return None
    midi_note = 12 * np.log2(freq / A4) + MIDI_A4
    return int(round(midi_note))

def midi_to_note(midi_note):
    """MIDI number to note name."""
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = (midi_note // 12) - 1
    note_name = notes[midi_note % 12]
    return note_name, octave

def quantize_to_key(note_name, key='C major'):
    """Map any note to nearest scale tone (naive diatonic mapping)."""
    major_scales = {
        'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
        'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
        'A major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
        'E major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
        'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
        'Bb major': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
        'Eb major': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
        'Ab major': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    }
    scale = major_scales.get(key, major_scales['C major'])
    if note_name in scale:
        return note_name
    # Simple fallback: return tonic
    return scale[0]

def quantize_duration(seconds, tempo=120):
    """Quantize duration to nearest rhythmic value (quarter = 1)."""
    beat = 60.0 / tempo
    beats = seconds / beat
    # For short recordings, cap durations to 2 beats (half note)
    beats = min(beats, 2.0)
    # Round to nearest common division, favor shorter notes
    divisions = np.array([2.0, 1.0, 0.5, 0.25, 0.125, 0.0625])
    idx = np.argmin(np.abs(divisions - beats))
    return float(divisions[idx])

def audio_to_melody(audio_path, key='C major', tempo=120):
    """Load audio, detect pitch, and quantize to a simple melody with fallback."""
    sr, y = load_audio(audio_path)
    print(f"[DEBUG] Loaded audio: sr={sr}, length={len(y)/sr:.2f}s, rms={np.sqrt(np.mean(y**2)):.4f}")
    pitches, times = autocorr_pitch(y, sr)
    print(f"[DEBUG] Detected raw pitches: {len(pitches)}")
    if len(pitches) < 3:
        # Only fallback if almost nothing detected
        print("[DEBUG] Using fallback scale (too few pitches)")
        return fallback_scale(key, tempo)

    # Convert to MIDI notes
    midi_notes = [freq_to_midi(f) for f in pitches if f > 0]
    note_names_octaves = [midi_to_note(m) for m in midi_notes if m is not None]
    print(f"[DEBUG] MIDI notes: {midi_notes[:10]}...")  # first 10

    # Group into notes (simple segmentation)
    notes = []
    if not note_names_octaves:
        print("[DEBUG] No note names, using fallback")
        return fallback_scale(key, tempo)

    prev_note = None
    note_start_time = None

    for i, ((note_name, octave), t) in enumerate(zip(note_names_octaves, times)):
        # Skip key quantization to see actual detected notes
        current = {'note': note_name, 'octave': octave}
        if prev_note is None or current != prev_note:
            # Close previous note
            if prev_note is not None and note_start_time is not None:
                duration = t - note_start_time
                duration = quantize_duration(duration, tempo)
                notes.append({**prev_note, 'duration': duration})
            # Start new note
            note_start_time = t
            prev_note = current
        # else: same note continues

    # Close trailing note
    if prev_note is not None and note_start_time is not None:
        duration = times[-1] - note_start_time
        duration = quantize_duration(duration, tempo)
        notes.append({**prev_note, 'duration': duration})

    # Post-process: merge and limit (allow more notes)
    notes = merge_and_limit_notes(notes, max_notes=24)

    print(f"[DEBUG] Final notes: {notes}")
    return notes

def fallback_scale(key='C major', tempo=120):
    """Return a simple diatonic scale when no pitches are detected."""
    major_scales = {
        'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
        'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
        'A major': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
        'E major': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
        'F major': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
        'Bb major': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
        'Eb major': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
        'Ab major': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    }
    scale = major_scales.get(key, major_scales['C major'])
    # Simple ascending scale with quarter notes
    return [{'note': n, 'octave': 4, 'duration': 1.0} for n in scale]
