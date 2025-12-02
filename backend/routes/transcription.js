const express = require('express');
const multer = require('multer');

const router = express.Router();

const { transcribePerformance } = require('../controllers/transcriptionController');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  console.log('[ROUTE] Test endpoint hit');
  res.json({
    success: true,
    message: 'Transcription route is working!',
    endpoint: '/api/transcription/performance',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

// Health check for transcription service
router.get('/health', (req, res) => {
  console.log('[ROUTE] Health check endpoint hit');
  res.json({
    success: true,
    status: 'online',
    service: 'FREE Music Transcription',
    features: ['Melody Generation', 'Multiple Scales', 'Style Variations'],
    timestamp: new Date().toISOString()
  });
});

// Main transcription endpoint - NO AUTH REQUIRED for simplicity
router.post('/performance', (req, res, next) => {
  console.log('[ROUTE] Performance endpoint hit');
  console.log('[ROUTE] Has file:', !!req.file);
  console.log('[ROUTE] Body:', req.body);
  next();
}, upload.single('audio'), transcribePerformance);

module.exports = router;
