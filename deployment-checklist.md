# 🚀 Deployment Checklist

## ✅ Backend (Render)
- [ ] Repository connected to Render
- [ ] PostgreSQL database created
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (from PostgreSQL service)
  - [ ] `JWT_SECRET` (long, secure string)
  - [ ] `JWT_EXPIRE=30d`
  - [ ] `FRONTEND_URL` (your Netlify URL)
  - [ ] `SPOTIFY_CLIENT_ID`
  - [ ] `SPOTIFY_CLIENT_SECRET`
  - [ ] `OPENAI_API_KEY`
- [ ] Build and deployment successful
- [ ] API health check works: `https://your-backend.onrender.com/api/health`

## ✅ Frontend (Netlify)
- [ ] Repository connected to Netlify
- [ ] Build settings configured:
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `frontend/dist`
- [ ] Environment variables set:
  - [ ] `VITE_API_URL` (your Render backend URL)
  - [ ] `VITE_APP_NAME=Spatial AI Platform`
  - [ ] `VITE_APP_VERSION=1.0.0`
- [ ] Build and deployment successful
- [ ] Site loads correctly
- [ ] API calls work (check browser console)

## 🧪 Testing
- [ ] Homepage loads
- [ ] Resources page works (all 6 links open)
- [ ] Spatial Audio Studio works (demo sounds play)
- [ ] Training page visualizations work
- [ ] AI Music Composer works with undo
- [ ] Student Practice Area works
- [ ] All API endpoints respond correctly

## 🔧 Troubleshooting URLs
- **Backend Health:** `https://your-backend.onrender.com/api/health`
- **Frontend:** `https://your-site.netlify.app`
- **Render Logs:** Render Dashboard → Service → Logs
- **Netlify Logs:** Netlify Dashboard → Site → Deploys
