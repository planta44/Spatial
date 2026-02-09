const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getPageContent, upsertPageContent } = require('../controllers/pageContentController');

// Public routes
router.get('/:slug', getPageContent);

// Protected routes
router.put('/:slug', protect, authorize('teacher', 'admin'), upsertPageContent);

module.exports = router;
