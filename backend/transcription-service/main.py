from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import tempfile
import os
from transcribe import audio_to_melody

app = FastAPI(title="Transcription Service", version="1.0.0")

@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    key: str = Form(default="C major"),
    tempo: str = Form(default="120"),
    length: str = Form(default="8"),
    style: str = Form(default="classical")
):
    """
    Accept an audio file and return a simple melody (list of notes with durations).
    This is a lightweight, free, open-source transcription service.
    """
    try:
        # Save uploaded audio to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Run transcription
        melody = audio_to_melody(tmp_path, key=key, tempo=int(tempo))

        # Debug: print detected pitches
        print(f"[DEBUG] Detected {len(melody)} notes: {melody}")

        # Clean up temp file
        os.unlink(tmp_path)

        # Return in the same shape the frontend expects
        return JSONResponse({
            "melody": melody,
            "key": key,
            "tempo": int(tempo),
            "composition": {
                "melody": melody,
                "key": key,
                "tempo": int(tempo),
            }
        })
    except Exception as e:
        import traceback
        print(f"[ERROR] Transcription failed: {e}")
        print(traceback.format_exc())
        return JSONResponse(
            {"error": f"Transcription failed: {str(e)}"},
            status_code=500
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
