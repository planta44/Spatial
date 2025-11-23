# Spatial AI Backend API

## Overview

RESTful API for the Spatial AI Music Teacher Training platform. Built with Node.js, Express, PostgreSQL, and Sequelize ORM.

## Setup

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend root:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spatial-ai
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user profile (Protected)
- `PUT /profile` - Update user profile (Protected)
- `PUT /change-password` - Change password (Protected)

### Resources (`/api/resources`)

- `GET /` - Get all resources (paginated)
- `GET /:id` - Get single resource
- `GET /category/:category` - Get resources by category
- `POST /` - Create resource (Teacher/Admin)
- `PUT /:id` - Update resource (Owner/Admin)
- `DELETE /:id` - Delete resource (Owner/Admin)
- `POST /:id/rate` - Rate resource (Protected)

### Policies (`/api/policies`)

- `GET /` - Get all policies (paginated)
- `GET /:id` - Get single policy
- `GET /stats` - Get policy statistics
- `GET /university/:name` - Get policies by university
- `POST /` - Create policy (Teacher/Admin)
- `PUT /:id` - Update policy (Owner/Admin)
- `DELETE /:id` - Delete policy (Owner/Admin)
- `PUT /:id/university/:universityId` - Update university status (Admin)

### Spatial Audio (`/api/spatial`)

- `GET /` - Get all spatial audio files (paginated)
- `GET /:id` - Get single spatial audio
- `GET /format/:format` - Get by format
- `POST /` - Create spatial audio (Protected)
- `PUT /:id` - Update spatial audio (Owner/Admin)
- `DELETE /:id` - Delete spatial audio (Owner/Admin)
- `POST /:id/like` - Like spatial audio (Protected)
- `POST /:id/comment` - Add comment (Protected)
- `POST /:id/analyze` - Analyze spatial audio (Protected)

## Data Models

### User
- name, email, password
- role: student, teacher, admin
- university, department, specialization
- completedModules, certifications

### Resource
- title, description, type, category
- difficulty, duration, fileUrl
- author, rating, views, downloads
- spatialAudioConfig

### Policy
- title, description, category, scope
- universities (with implementation status)
- objectives, requirements, budget
- timeline, stakeholders, impactMetrics

### SpatialAudio
- title, audioFileUrl, format, channels
- spatialConfig (position, orientation)
- analysis (frequency, waveform, localization)
- visualization URLs

## Authentication

Uses JWT tokens. Include in requests:

```
Authorization: Bearer <token>
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Error message"
}
```

## Testing

```bash
npm test
```

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── models/          # Sequelize models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Helper functions
├── uploads/         # File uploads directory
└── server.js        # Entry point
```

## License

MIT