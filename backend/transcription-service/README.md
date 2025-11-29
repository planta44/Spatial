# Transcription Service (Python)

This lightweight service uses librosa to detect pitch from audio and quantize it to a simple melody. It’s free, open-source, and can be deployed alongside your Node backend.

## Setup

```bash
cd backend/transcription-service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## Run locally

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The service will be available at `http://localhost:8000`.

## Deploy

- Deploy as a separate container/process.
- Ensure the Node backend can reach it via `TRANSCRIPTION_SERVICE_URL` (default `http://localhost:8000`).
- No external APIs or paid services required.
