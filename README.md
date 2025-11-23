# Spatial AI for Music Teacher Training

> Policy, Resources, and Scalability in Kenyan Universities

## Overview

This platform provides a comprehensive Spatial AI solution for music teacher training, designed to support Kenyan universities with policy management, resource allocation, and scalable training programs.

## Project Structure

```
Spatial AI/
├── backend/          # Node.js/Express API server
├── frontend/         # React application
└── README.md         # This file
```

## Features

- **Spatial Audio Analysis**: 3D audio visualization and analysis tools
- **Teacher Training Resources**: Comprehensive learning materials and modules
- **Policy Management**: Track and manage educational policies
- **Scalability Tools**: University-wide deployment and monitoring
- **Admin Dashboard**: Centralized control and analytics
- **Resource Library**: Curated music education materials

## Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## Technology Stack

### Backend
- Node.js + Express
- PostgreSQL (Database) + Sequelize ORM
- JWT Authentication
- Spatial Audio Processing
- RESTful API

### Frontend
- React + Vite
- TailwindCSS (Styling)
- Three.js (3D Visualization)
- Lucide React (Icons)
- React Router (Navigation)

## Key Modules

### 1. Spatial Audio Engine
Real-time 3D audio analysis and visualization for music teaching.

### 2. Training Resources
Comprehensive modules for teacher professional development.

### 3. Policy Framework
Tools for managing educational policies and compliance.

### 4. Scalability Dashboard
Monitor deployment across multiple universities.

## Documentation

- Backend API docs: `backend/README.md`
- Frontend docs: `frontend/README.md`

## License

MIT