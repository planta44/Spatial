# 🔧 Local Development Setup - Klang.io Integration

## 📋 Prerequisites

- Node.js (v16+)
- PostgreSQL database running
- Klang.io API Key: `0xkl-7c3da76296b2358e89c6077234506b3d`

---

## 🚀 Quick Start

### 1. Backend Setup

#### Add to `backend/.env`:
```bash
NODE_ENV=development
PORT=5001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spatial_ai
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Frontend
FRONTEND_URL=http://localhost:5173

# Klang.io API (ADD THIS!)
KLANG_API_KEY=0xkl-7c3da76296b2358e89c6077234506b3d
```

#### Install dependencies and start:
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ All routes registered including /api/transcription
🚀 Spatial AI API Server running on port 5001
```

---

### 2. Frontend Setup

#### Verify `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5001/api
```

#### Start frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Test Transcription

### Test 1: Check Route is Registered
Visit: http://localhost:5001/api/transcription/test

Should return:
```json
{
  "success": true,
  "message": "Transcription route is working!",
  "endpoint": "/api/transcription/performance",
  "method": "POST"
}
```

### Test 2: Check Backend Health
Visit: http://localhost:5001/api/health

Should return:
```json
{
  "status": "OK",
  "message": "Spatial AI API is running"
}
```

### Test 3: Full Transcription Test
1. Go to: http://localhost:5173
2. Login/Register
3. Navigate: **Student Practice → 3D Lab**
4. Click **"Start Recording"** or **"Upload Audio"**
5. Record/upload a melody (5-10 seconds)
6. Click **"Convert to Score"**
7. Check backend console for logs:
   ```
   [KLANG] Transcription request received
   [KLANG] Sending audio to Klang.io API...
   [KLANG] Response received from Klang.io API
   [KLANG] Status: 200
   [KLANG] Parsed X notes from response
   ```

---

## 🔍 Troubleshooting

### "Route not found" Error

**Check 1: Is backend running?**
```bash
# Should see server on port 5001
curl http://localhost:5001/api/health
```

**Check 2: Is route registered?**
```bash
curl http://localhost:5001/api/transcription/test
```

**Check 3: Restart backend**
```bash
# Kill the server (Ctrl+C)
# Start again
npm run dev
```

### "KLANG_API_KEY not found"

**Check:** Open `backend/.env` and ensure:
```
KLANG_API_KEY=0xkl-7c3da76296b2358e89c6077234506b3d
```

**Fix:** Add the line above to your `.env` file and restart backend.

### "Cannot connect to database"

**Check:** PostgreSQL is running:
```bash
# Windows
pg_ctl status

# Or check services
services.msc
```

**Fix:** Start PostgreSQL or update `DB_*` variables in `.env`

### Still getting errors?

1. **Clear node_modules and reinstall:**
   ```bash
   cd backend
   rm -rf node_modules
   npm install
   ```

2. **Check console logs:**
   - Backend logs show detailed error messages
   - Look for `[KLANG]` prefixed messages

3. **Verify API key:**
   - Test the API key directly at https://api.klang.io
   - Check if it's expired or invalid

---

## 📝 Environment Variables Summary

### Backend (`backend/.env`):
```bash
NODE_ENV=development
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spatial_ai
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
KLANG_API_KEY=0xkl-7c3da76296b2358e89c6077234506b3d  # ← IMPORTANT!
```

### Frontend (`frontend/.env`):
```bash
VITE_API_URL=http://localhost:5001/api
```

---

## 🎯 Architecture

```
Frontend (localhost:5173)
    ↓ POST /api/transcription/performance
Node.js Backend (localhost:5001)
    ↓ Uses KLANG_API_KEY
    ↓ POST https://api.klang.io/v1/transcribe
Klang.io API
    ↓ Returns transcribed notes
    ↓
Back to Frontend! 🎵
```

**Simple, one-service architecture!**

---

## ✅ Checklist

- [ ] PostgreSQL is running
- [ ] `backend/.env` has `KLANG_API_KEY`
- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 5173
- [ ] Test endpoint works: http://localhost:5001/api/transcription/test
- [ ] Health check works: http://localhost:5001/api/health
- [ ] Transcription works in 3D Lab

---

## 🚢 Deploy to Production

Once local testing works:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update transcription with Klang.io"
   git push origin main
   ```

2. On Render:
   - Add `KLANG_API_KEY` to Node.js backend environment variables
   - Service will auto-deploy
   - Wait for "Live" status
   - Test on production URL

---

**Happy coding! 🚀**
