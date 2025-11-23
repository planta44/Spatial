const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSpatialAudios,
  getSpatialAudio,
  createSpatialAudio,
  updateSpatialAudio,
  deleteSpatialAudio,
  likeSpatialAudio,
  addComment,
  analyzeSpatialAudio,
  getSpatialAudioByFormat
} = require('../controllers/spatialController');

// Public routes
router.get('/', getSpatialAudios);
router.get('/format/:format', getSpatialAudioByFormat);
router.get('/:id', getSpatialAudio);

// Protected routes
router.post('/', protect, createSpatialAudio);
router.put('/:id', protect, updateSpatialAudio);
router.delete('/:id', protect, deleteSpatialAudio);
router.post('/:id/like', protect, likeSpatialAudio);
router.post('/:id/comment', protect, addComment);
router.post('/:id/analyze', protect, analyzeSpatialAudio);

module.exports = router;