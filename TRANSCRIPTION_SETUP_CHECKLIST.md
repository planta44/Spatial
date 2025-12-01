# 🔧 Transcription Setup Checklist - "Route not found" Fix

## ✅ What I Fixed

**Problem:** Express.js middleware order was wrong
- Error handler was BEFORE 404 handler ❌
- This caused all unmatched routes to return "Route not found"

**Solution:** Swapped middleware order in `server.js`
- 404 handler now comes BEFORE error handler ✅
- Pushed to GitHub (commit c5f0cfed)

---

## 🚀 Complete Setup Steps (Do ALL of These)

### Step 1: Verify Node.js Backend Has Environment Variable ⚠️ CRITICAL

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your **Node.js backend service** (NOT Python)
3. Go to **"Environment"** tab
4. Check if `TRANSCRIPTION_SERVICE_URL` exists:
   
   **If it EXISTS:**
   - Verify value is: `https://spatial-ai-transcription.onrender.com`
   - If wrong, update it and save
   
   **If it DOESN'T EXIST:**
   - Click **"Add Environment Variable"**
   - Key: `TRANSCRIPTION_SERVICE_URL`
   - Value: `https://spatial-ai-transcription.onrender.com`
   - Click **"Save Changes"**

### Step 2: Verify Python Service Has API Key

1. Go to your **Python transcription service** on Render
2. Go to **"Environment"** tab
3. Check if `KLANG_API_KEY` exists:
   
   **If it EXISTS:**
   - Verify value is: `0xkl-7c3da76296b2358e89c6077234506b3d`
   - If wrong, update it and save
   
   **If it DOESN'T EXIST:**
   - Click **"Add Environment Variable"**
   - Key: `KLANG_API_KEY`
   - Value: `0xkl-7c3da76296b2358e89c6077234506b3d`
   - Click **"Save Changes"**

### Step 3: Trigger Manual Redeploy of Node.js Backend

Since I fixed the code, you need to redeploy:

1. Go to your **Node.js backend service** on Render
2. Click **"Manual Deploy"** tab
3. Click **"Clear build cache & deploy"**
4. Wait ~3-5 minutes for deployment

### Step 4: Test the Fix

**Test 1: Check Backend is Running**
- Visit: `https://[your-nodejs-backend].onrender.com/api/health`
- Should return: `{"status": "OK", "message": "Spatial AI API is running"}`

**Test 2: Check Python Service**
- Visit: `https://spatial-ai-transcription.onrender.com/`
- Should return: `{"status": "online", "provider": "Klang.io API"}`

**Test 3: Try Transcription**
1. Go to: https://spatial-ai.netlify.app
2. Login
3. Go to: **Student Practice → 3D Lab**
4. Click **"Start Recording"** or **"Upload Audio"**
5. Record/upload a melody
6. Click **"Convert to Score"**
7. Should work now! 🎉

---

## 🔍 How to Check Render Logs

### Check Node.js Backend Logs:
1. Go to Node.js service on Render
2. Click **"Logs"** tab
3. Look for:
   ```
   [Transcription] Request received
   [Transcription] Service URL: https://spatial-ai-transcription.onrender.com
   [Transcription] Sending request to Python service...
   ```

### Check Python Service Logs:
1. Go to Python service on Render
2. Click **"Logs"** tab
3. Look for:
   ```
   [KLANG] Transcription request received
   [KLANG] Starting transcription for: /tmp/xyz.webm
   [KLANG] Sending request to Klang.io API...
   ```

---

## ❌ Common Errors & Solutions

### Error: "Route not found"
**Cause:** Middleware order was wrong (FIXED!) OR `TRANSCRIPTION_SERVICE_URL` not set
**Solution:** 
- Wait for Node.js backend to redeploy with new code
- Verify `TRANSCRIPTION_SERVICE_URL` is set (Step 1 above)

### Error: "Request failed with status code 404"
**Cause:** `TRANSCRIPTION_SERVICE_URL` is not set or is wrong
**Solution:** 
- Add/fix environment variable (Step 1 above)
- Make sure it points to: `https://spatial-ai-transcription.onrender.com`

### Error: "Transcription service unavailable"
**Cause:** Python service is offline or URL is wrong
**Solution:**
- Check Python service is running (green "Live" badge)
- Verify `TRANSCRIPTION_SERVICE_URL` is correct
- Check Python service logs for errors

### Error: "KLANG_API_KEY not found"
**Cause:** API key not set in Python service
**Solution:**
- Add environment variable to **Python service** (Step 2 above)

### Error: "401 Unauthorized" from Klang.io
**Cause:** API key is invalid or expired
**Solution:**
- Verify API key is: `0xkl-7c3da76296b2358e89c6077234506b3d`
- Check https://klang.io/dashboard if key is active

---

## 📋 Environment Variables Summary

### Node.js Backend Service:
```
TRANSCRIPTION_SERVICE_URL=https://spatial-ai-transcription.onrender.com
JWT_SECRET=<your-jwt-secret>
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=<your-db-name>
FRONTEND_URL=https://spatial-ai.netlify.app
```

### Python Transcription Service:
```
KLANG_API_KEY=0xkl-7c3da76296b2358e89c6077234506b3d
```

---

## 🎯 Final Verification

After completing ALL steps above:

1. ✅ Node.js backend has `TRANSCRIPTION_SERVICE_URL`
2. ✅ Python service has `KLANG_API_KEY`
3. ✅ Node.js backend redeployed with new code
4. ✅ Both services show "Live" on Render
5. ✅ Health checks return OK
6. ✅ Transcription works in 3D Lab

---

## 💡 Understanding the Flow

```
User Records Audio
    ↓
Frontend (Netlify)
    ↓ POST /api/transcription/performance
Node.js Backend (Render)
    ↓ Uses TRANSCRIPTION_SERVICE_URL
    ↓ POST https://spatial-ai-transcription.onrender.com/transcribe
Python Service (Render)
    ↓ Uses KLANG_API_KEY
    ↓ POST https://api.klang.io/v1/transcribe
Klang.io API
    ↓ Returns transcribed notes
    ↓
All the way back to User! 🎵
```

---

**If you follow ALL steps above, transcription WILL work! 🚀**
