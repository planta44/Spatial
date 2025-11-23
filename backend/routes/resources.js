const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  rateResource,
  getResourcesByCategory
} = require('../controllers/resourceController');

// Public routes
router.get('/', getResources);
router.get('/category/:category', getResourcesByCategory);
router.get('/:id', getResource);

// Protected routes
router.post('/', protect, authorize('teacher', 'admin'), createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.post('/:id/rate', protect, rateResource);

module.exports = router;