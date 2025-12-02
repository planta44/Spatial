const express = require('express');
const multer = require('multer');

const router = express.Router();

const { optionalAuth } = require('../middleware/auth');
const { transcribePerformance } = require('../controllers/transcriptionController');

const upload = multer({ storage: multer.memoryStorage() });

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Transcription route is working!',
    endpoint: '/api/transcription/performance',
    method: 'POST'
  });
});

// Main transcription endpoint
router.post('/performance', upload.single('audio'), optionalAuth, transcribePerformance);

module.exports = router;
