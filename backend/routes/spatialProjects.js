const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createProject,
  uploadAudioTracks,
  updateSpatialConfig,
  saveProjectState,
  getUserProjects,
  getProject,
  deleteProject,
  shareProject,
  getPublicProjects
} = require('../controllers/spatialProjectController');

// Project management
router.post('/', protect, createProject);
router.get('/', protect, getUserProjects);
router.get('/public', getPublicProjects);
router.get('/:id', protect, getProject);
router.delete('/:id', protect, deleteProject);

// Audio upload
router.post('/:id/upload-tracks', protect, uploadAudioTracks);

// Spatial configuration
router.put('/:id/spatial-config', protect, updateSpatialConfig);
router.put('/:id/save-state', protect, saveProjectState);

// Sharing
router.put('/:id/share', protect, shareProject);

module.exports = router;
