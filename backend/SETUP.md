# 🚀 Spatial AI Platform - Database Setup Guide

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** (v16 or higher)
3. **npm** or **yarn**

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spatial_ai
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# API Keys (optional)
OPENAI_API_KEY=your_openai_key
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Database

#### Option A: Using Sequelize (Recommended)
```bash
npm run sync-models
```

#### Option B: Using SQL Script
```bash
npm run setup-db
```

### 4. Start the Server
```bash
npm run dev
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check your `.env` file credentials
3. Create the database if it doesn't exist:
   ```sql
   CREATE DATABASE spatial_ai;
   ```

### Missing PostGIS Extension
If you get geometry type errors:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Permission Issues
Make sure your PostgreSQL user has the necessary permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE spatial_ai TO postgres;
```

## Default Admin Account

After setup, you can login with:
- **Email:** ruachkol@gmail.com
- **Password:** admin123

⚠️ **Important:** Change the admin password in production!

## Database Tables Created

The setup creates these tables:
- `users` - User accounts
- `universities` - Educational institutions
- `courses` - Training courses
- `compositions` - AI-generated music
- `spatial_projects` - 3D audio projects
- `certifications` - Available certificates
- `user_certifications` - Issued certificates
- `policies` - Educational policies
- `resources` - Training materials
- `spatial_audios` - Audio files
- `artists` - Musician data
- `region_analytics` - Geographic data

## API Endpoints

Once running, access these endpoints:
- `http://localhost:5000/` - API overview
- `http://localhost:5000/api/health` - Health check
- `http://localhost:5000/api/auth/register` - User registration
- `http://localhost:5000/api/compositions/generate/melody` - AI melody generation
- `http://localhost:5000/api/spatial-projects` - Spatial audio projects

## Development Commands

```bash
# Start development server
npm run dev

# Setup/reset database
npm run sync-models

# Alternative database setup
npm run setup-db

# Start production server
npm start
```

## Next Steps

1. Start the frontend: `cd ../frontend && npm run dev`
2. Visit: `http://localhost:5173`
3. Register a new account or use admin login
4. Begin creating AI compositions and spatial audio projects!

🎉 **You're all set!** The Spatial AI platform is ready for music education innovation!
