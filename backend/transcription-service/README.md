# Spatial AI Transcription Service

**Professional audio-to-notation transcription powered by [Klang.io](https://klang.io) API**

This service provides high-quality music transcription using Klang.io's advanced machine learning models for pitch detection, note recognition, and rhythm quantization.

## 🎵 Features

- **Professional-grade transcription** using Klang.io's ML models
- **Automatic key detection** - No manual key specification needed
- **Automatic tempo detection** - Detects BPM from audio
- **Multi-format support** - WebM, MP3, WAV, and more
- **RESTful API** - Easy integration with any frontend
- **Accurate note detection** - Including pitch, octave, and duration

## 🔑 API Key Setup

1. Get your Klang.io API key from: https://klang.io/dashboard
2. Set environment variable:
   ```bash
   export KLANG_API_KEY="your-api-key-here"
   ```

## 🚀 Setup

```bash
cd backend/transcription-service
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

## 💻 Run Locally

```bash
# Set your API key
export KLANG_API_KEY="0xkl-7c3da76296b2358e89c6077234506b3d"

# Start the service
uvicorn main:app --host 0.0.0.0 --port 8000
```

The service will be available at `http://localhost:8000`.

## ☁️ Deploy to Render

1. **Create new Web Service** on Render
2. **Connect your repository**
3. **Set Environment Variables:**
   ```
   KLANG_API_KEY=0xkl-7c3da76296b2358e89c6077234506b3d
   ```
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📡 API Endpoints

### GET `/`
Health check and service info
```json
{
  "status": "online",
  "service": "Spatial AI Transcription Service (Powered by Klang.io)",
  "version": "2.0.0",
  "provider": "Klang.io API"
}
```

### POST `/transcribe`
Transcribe audio to musical notation

**Parameters:**
- `audio` (file): Audio file (WebM, MP3, WAV)
- `key` (optional): Musical key
- `tempo` (optional): Tempo in BPM

**Response:**
```json
{
  "melody": [
    {"note": "C", "octave": 4, "duration": 1.0},
    {"note": "D", "octave": 4, "duration": 0.5}
  ],
  "key": "C major",
  "tempo": 120
}
```

## 🔗 Integration

Update your Node.js backend `.env`:
```
TRANSCRIPTION_SERVICE_URL=https://your-service.onrender.com
```

## 📝 Notes

- **Previous Implementation:** Replaced librosa-based pitch detection with Klang.io API
- **Why Klang.io?** Professional-grade transcription with superior accuracy
- **No Local Processing:** Audio is sent to Klang.io for cloud processing
