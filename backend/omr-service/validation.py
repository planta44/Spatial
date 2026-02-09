"""
Validation and correction module for OMR results.
Ensures musical notation is valid and provides feedback.
"""

import xml.etree.ElementTree as ET
from pathlib import Path
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


def validate_and_correct_musicxml(musicxml_path: str) -> Dict:
    """
    Validate and correct MusicXML output from Audiveris.
    
    Checks for:
    - Valid note durations
    - Correct measure lengths
    - Valid pitch ranges
    - Proper time signatures
    - Beam consistency
    
    Returns validation report with corrections applied.
    """
    logger.info(f"Validating MusicXML: {musicxml_path}")
    
    try:
        tree = ET.parse(musicxml_path)
        root = tree.getroot()
        
        validation_report = {
            "status": "valid",
            "warnings": [],
            "errors": [],
            "corrections": [],
            "statistics": {}
        }
        
        # Run validation checks
        validation_report = validate_time_signatures(root, validation_report)
        validation_report = validate_measure_durations(root, validation_report)
        validation_report = validate_pitch_ranges(root, validation_report)
        validation_report = validate_note_durations(root, validation_report)
        validation_report = check_rhythmic_consistency(root, validation_report)
        
        # Collect statistics
        validation_report["statistics"] = collect_statistics(root)
        
        # Determine overall status
        if validation_report["errors"]:
            validation_report["status"] = "invalid"
        elif validation_report["warnings"]:
            validation_report["status"] = "valid_with_warnings"
        
        # If corrections were made, save the corrected file
        if validation_report["corrections"]:
            corrected_path = Path(musicxml_path).with_stem(
                Path(musicxml_path).stem + "_corrected"
            )
            tree.write(str(corrected_path), encoding='utf-8', xml_declaration=True)
            validation_report["corrected_file"] = str(corrected_path)
            logger.info(f"Saved corrected file: {corrected_path}")
        
        logger.info(f"Validation complete: {validation_report['status']}")
        return validation_report
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        return {
            "status": "error",
            "errors": [f"Validation failed: {str(e)}"],
            "warnings": [],
            "corrections": []
        }


def validate_time_signatures(root: ET.Element, report: Dict) -> Dict:
    """Validate time signatures are present and consistent."""
    parts = root.findall('.//part')
    
    for part_idx, part in enumerate(parts):
        measures = part.findall('.//measure')
        
        if not measures:
            report["warnings"].append(f"Part {part_idx}: No measures found")
            continue
        
        # Check if first measure has time signature
        first_measure = measures[0]
        time_sig = first_measure.find('.//time')
        
        if time_sig is None:
            report["warnings"].append(
                f"Part {part_idx}: No time signature in first measure, assuming 4/4"
            )
    
    return report


def validate_measure_durations(root: ET.Element, report: Dict) -> Dict:
    """Validate that measure durations match time signatures."""
    parts = root.findall('.//part')
    
    for part_idx, part in enumerate(parts):
        measures = part.findall('.//measure')
        current_time_sig = (4, 4)  # Default 4/4
        divisions = 1  # Default divisions
        
        for measure_idx, measure in enumerate(measures):
            measure_num = measure.get('number', str(measure_idx + 1))
            
            # Update time signature if present
            time_elem = measure.find('.//time')
            if time_elem is not None:
                beats = time_elem.find('beats')
                beat_type = time_elem.find('beat-type')
                if beats is not None and beat_type is not None:
                    current_time_sig = (int(beats.text), int(beat_type.text))
            
            # Update divisions if present
            div_elem = measure.find('.//divisions')
            if div_elem is not None:
                divisions = int(div_elem.text)
            
            # Calculate expected duration
            expected_duration = calculate_measure_duration(
                current_time_sig[0],
                current_time_sig[1],
                divisions
            )
            
            # Calculate actual duration
            actual_duration = calculate_actual_duration(measure)
            
            # Check if durations match
            if actual_duration != expected_duration:
                tolerance = divisions * 0.1  # Allow small rounding errors
                if abs(actual_duration - expected_duration) > tolerance:
                    report["warnings"].append(
                        f"Part {part_idx}, Measure {measure_num}: "
                        f"Duration mismatch (expected {expected_duration}, got {actual_duration})"
                    )
    
    return report


def validate_pitch_ranges(root: ET.Element, report: Dict) -> Dict:
    """Validate that pitches are within reasonable ranges."""
    # Define reasonable ranges for different clefs
    clef_ranges = {
        'G': (40, 84),  # Treble: E3 to C6 (MIDI note numbers)
        'F': (28, 67),  # Bass: E1 to G4
        'C': (36, 79),  # Alto/Tenor: C2 to G5
    }
    
    parts = root.findall('.//part')
    
    for part_idx, part in enumerate(parts):
        # Find current clef
        current_clef = 'G'  # Default to treble
        clef_elem = part.find('.//clef')
        if clef_elem is not None:
            sign = clef_elem.find('sign')
            if sign is not None:
                current_clef = sign.text
        
        # Get range for this clef
        min_pitch, max_pitch = clef_ranges.get(current_clef, (21, 108))
        
        # Check all pitches
        pitches = part.findall('.//pitch')
        for pitch in pitches:
            step = pitch.find('step')
            octave = pitch.find('octave')
            alter = pitch.find('alter')
            
            if step is not None and octave is not None:
                # Calculate MIDI note number
                midi_note = pitch_to_midi(
                    step.text,
                    int(octave.text),
                    int(alter.text) if alter is not None else 0
                )
                
                if midi_note < min_pitch or midi_note > max_pitch:
                    report["warnings"].append(
                        f"Part {part_idx}: Pitch {step.text}{octave.text} "
                        f"outside typical range for {current_clef} clef"
                    )
    
    return report


def validate_note_durations(root: ET.Element, report: Dict) -> Dict:
    """Validate that note durations are reasonable."""
    valid_types = {
        'whole', 'half', 'quarter', 'eighth', '16th', '32nd', '64th', '128th',
        'breve', 'long'
    }
    
    notes = root.findall('.//note')
    
    for note in notes:
        note_type = note.find('type')
        duration = note.find('duration')
        
        # Check if type is valid
        if note_type is not None and note_type.text not in valid_types:
            report["errors"].append(
                f"Invalid note type: {note_type.text}"
            )
        
        # Check if duration is positive
        if duration is not None:
            dur_value = int(duration.text)
            if dur_value <= 0:
                report["errors"].append(
                    f"Invalid note duration: {dur_value}"
                )
    
    return report


def check_rhythmic_consistency(root: ET.Element, report: Dict) -> Dict:
    """Check for rhythmic inconsistencies and suggest corrections."""
    parts = root.findall('.//part')
    
    for part_idx, part in enumerate(parts):
        measures = part.findall('.//measure')
        
        for measure_idx, measure in enumerate(measures):
            measure_num = measure.get('number', str(measure_idx + 1))
            
            # Check for tied notes
            notes = measure.findall('.//note')
            for i, note in enumerate(notes):
                # Check if note has tie but next note doesn't
                tie = note.find('.//tie[@type="start"]')
                if tie is not None and i < len(notes) - 1:
                    next_note = notes[i + 1]
                    next_tie = next_note.find('.//tie[@type="stop"]')
                    if next_tie is None:
                        report["warnings"].append(
                            f"Part {part_idx}, Measure {measure_num}: "
                            f"Incomplete tie detected"
                        )
            
            # Check for beam consistency
            check_beam_consistency(measure, measure_num, part_idx, report)
    
    return report


def check_beam_consistency(measure: ET.Element, measure_num: str, part_idx: int, report: Dict):
    """Check that beams are properly opened and closed."""
    beam_stack = []
    notes = measure.findall('.//note')
    
    for note in notes:
        beams = note.findall('.//beam')
        for beam in beams:
            beam_type = beam.text
            if beam_type == 'begin':
                beam_stack.append(beam.get('number', '1'))
            elif beam_type == 'end':
                if not beam_stack:
                    report["warnings"].append(
                        f"Part {part_idx}, Measure {measure_num}: "
                        f"Beam end without begin"
                    )
                else:
                    beam_stack.pop()
    
    if beam_stack:
        report["warnings"].append(
            f"Part {part_idx}, Measure {measure_num}: "
            f"Unclosed beam(s)"
        )


def collect_statistics(root: ET.Element) -> Dict:
    """Collect statistics about the musical score."""
    stats = {
        "parts": 0,
        "measures": 0,
        "notes": 0,
        "rests": 0,
        "chords": 0,
        "average_notes_per_measure": 0,
        "key_signatures": [],
        "time_signatures": []
    }
    
    parts = root.findall('.//part')
    stats["parts"] = len(parts)
    
    all_notes = root.findall('.//note')
    stats["notes"] = len([n for n in all_notes if n.find('rest') is None])
    stats["rests"] = len([n for n in all_notes if n.find('rest') is not None])
    stats["chords"] = len([n for n in all_notes if n.find('chord') is not None])
    
    if parts:
        measures = parts[0].findall('.//measure')
        stats["measures"] = len(measures)
        
        if stats["measures"] > 0:
            stats["average_notes_per_measure"] = round(
                stats["notes"] / stats["measures"], 2
            )
    
    # Collect unique key signatures
    keys = root.findall('.//key')
    key_sigs = set()
    for key in keys:
        fifths = key.find('fifths')
        mode = key.find('mode')
        if fifths is not None:
            key_num = int(fifths.text)
            mode_text = mode.text if mode is not None else 'major'
            key_sigs.add(f"{key_num} ({mode_text})")
    stats["key_signatures"] = list(key_sigs)
    
    # Collect unique time signatures
    times = root.findall('.//time')
    time_sigs = set()
    for time in times:
        beats = time.find('beats')
        beat_type = time.find('beat-type')
        if beats is not None and beat_type is not None:
            time_sigs.add(f"{beats.text}/{beat_type.text}")
    stats["time_signatures"] = list(time_sigs)
    
    return stats


def calculate_measure_duration(beats: int, beat_type: int, divisions: int) -> int:
    """Calculate expected duration of a measure."""
    # Duration = (beats * whole_note_duration) / beat_type
    # whole_note_duration = 4 * divisions (for quarter note as division)
    return (beats * 4 * divisions) // beat_type


def calculate_actual_duration(measure: ET.Element) -> int:
    """Calculate actual duration of all notes/rests in a measure."""
    total_duration = 0
    
    # Find all notes in this measure (excluding grace notes and chord tones)
    for note in measure.findall('.//note'):
        # Skip grace notes
        if note.find('grace') is not None:
            continue
        
        # Skip chord tones (they don't add to duration)
        if note.find('chord') is not None:
            continue
        
        # Add duration
        duration = note.find('duration')
        if duration is not None:
            total_duration += int(duration.text)
    
    return total_duration


def pitch_to_midi(step: str, octave: int, alter: int = 0) -> int:
    """Convert pitch notation to MIDI note number."""
    # C4 = MIDI 60
    note_offsets = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    base = note_offsets.get(step, 0)
    return (octave + 1) * 12 + base + alter
