import requests
import os
from typing import List, Dict

# Klang.io API Configuration
KLANG_API_KEY = os.getenv("KLANG_API_KEY", "0xkl-7c3da76296b2358e89c6077234506b3d")
KLANG_API_URL = "https://api.klang.io/v1/transcribe"

def transcribe_with_klang(audio_path: str) -> List[Dict]:
    """
    Transcribe audio using Klang.io's API for professional music transcription.
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        List of note dictionaries with format: {'note': 'C', 'octave': 4, 'duration': 1.0}
    """
    print(f"[KLANG] Starting transcription for: {audio_path}")
    
    try:
        # Prepare the file for upload
        with open(audio_path, 'rb') as audio_file:
            files = {
                'audio': (os.path.basename(audio_path), audio_file, 'audio/webm')
            }
            
            headers = {
                'Authorization': f'Bearer {KLANG_API_KEY}',
                'Accept': 'application/json'
            }
            
            # Optional parameters for better transcription
            data = {
                'format': 'musicxml',  # Request musical notation format
                'instrument': 'voice',  # Optimize for vocal input
                'tempo_detection': 'true',
                'key_detection': 'true'
            }
            
            print(f"[KLANG] Sending request to Klang.io API...")
            response = requests.post(
                KLANG_API_URL,
                files=files,
                headers=headers,
                data=data,
                timeout=60
            )
            
            print(f"[KLANG] Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"[KLANG] Transcription successful!")
                return parse_klang_response(result)
            else:
                print(f"[KLANG] Error: {response.status_code} - {response.text}")
                return fallback_scale()
                
    except requests.exceptions.RequestException as e:
        print(f"[KLANG] Network error: {e}")
        return fallback_scale()
    except Exception as e:
        print(f"[KLANG] Unexpected error: {e}")
        return fallback_scale()

def parse_klang_response(klang_result: Dict) -> List[Dict]:
    """
    Parse Klang.io API response and convert to our note format.
    
    Expected Klang response format:
    {
        'notes': [
            {'pitch': 'C4', 'duration': 1.0, 'onset': 0.0},
            {'pitch': 'D4', 'duration': 0.5, 'onset': 1.0},
            ...
        ],
        'tempo': 120,
        'key': 'C major'
    }
    """
    print(f"[KLANG] Parsing response: {klang_result}")
    
    notes = []
    klang_notes = klang_result.get('notes', [])
    
    if not klang_notes:
        print("[KLANG] No notes found in response, using fallback")
        return fallback_scale()
    
    for klang_note in klang_notes:
        try:
            # Parse pitch (e.g., "C4" -> note="C", octave=4)
            pitch = klang_note.get('pitch', 'C4')
            note_name, octave = parse_pitch(pitch)
            
            # Get duration (in beats, typically quarter note = 1.0)
            duration = float(klang_note.get('duration', 1.0))
            
            # Quantize duration to standard values
            duration = quantize_duration_simple(duration)
            
            notes.append({
                'note': note_name,
                'octave': octave,
                'duration': duration
            })
        except Exception as e:
            print(f"[KLANG] Error parsing note: {e}")
            continue
    
    # Limit to reasonable number of notes
    if len(notes) > 24:
        notes = notes[:24]
    
    print(f"[KLANG] Parsed {len(notes)} notes")
    return notes if notes else fallback_scale()

def parse_pitch(pitch_str: str) -> tuple:
    """
    Parse pitch string like 'C4', 'F#5', 'Bb3' into (note_name, octave).
    
    Args:
        pitch_str: Pitch string (e.g., "C4", "F#5")
        
    Returns:
        Tuple of (note_name, octave)
    """
    # Handle formats: C4, C#4, Cb4, etc.
    if len(pitch_str) < 2:
        return 'C', 4
    
    # Extract note name (with potential accidental)
    if len(pitch_str) == 2:  # e.g., "C4"
        note_name = pitch_str[0]
        octave = int(pitch_str[1])
    elif len(pitch_str) == 3:  # e.g., "C#4" or "Bb4"
        note_name = pitch_str[:2]
        octave = int(pitch_str[2])
    else:
        note_name = 'C'
        octave = 4
    
    return note_name, octave

def quantize_duration_simple(duration: float) -> float:
    """
    Quantize duration to nearest standard rhythmic value.
    
    Args:
        duration: Duration in beats
        
    Returns:
        Quantized duration (whole=4.0, half=2.0, quarter=1.0, eighth=0.5, sixteenth=0.25)
    """
    standard_durations = [4.0, 2.0, 1.0, 0.5, 0.25, 0.125]
    
    # Find nearest standard duration
    closest = min(standard_durations, key=lambda x: abs(x - duration))
    return closest

def audio_to_melody(audio_path, key='C major', tempo=120):
    """
    Main function to transcribe audio to melody using Klang.io API.
    This replaces the previous librosa-based implementation.
    
    Args:
        audio_path: Path to audio file
        key: Musical key (informational, Klang detects automatically)
        tempo: Tempo in BPM (informational, Klang detects automatically)
        
    Returns:
        List of note dictionaries
    """
    print(f"[KLANG] audio_to_melody called with: {audio_path}")
    print(f"[KLANG] Key: {key}, Tempo: {tempo}")
    
    # Use Klang.io API for transcription
    notes = transcribe_with_klang(audio_path)
    
    if not notes:
        print("[KLANG] Transcription failed, using fallback scale")
        return fallback_scale(key)
    
    print(f"[KLANG] Transcription complete: {len(notes)} notes")
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
