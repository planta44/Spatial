const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateMelody,
  generateChords,
  analyzeMelody,
  getUserCompositions,
  getComposition,
  updateComposition,
  deleteComposition,
  exportComposition
} = require('../controllers/compositionController');

// AI Composition Generation
router.post('/generate/melody', protect, generateMelody);
router.post('/generate/chords', protect, generateChords);
router.post('/analyze/melody', protect, analyzeMelody);

// CRUD operations
router.get('/', protect, getUserCompositions);
router.get('/:id', protect, getComposition);
router.put('/:id', protect, updateComposition);
router.delete('/:id', protect, deleteComposition);

// Export functionality
router.get('/:id/export', protect, exportComposition);

module.exports = router;
