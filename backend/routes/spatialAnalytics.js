const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMapData,
  getRegionalStats,
  analyzeHotspots
} = require('../controllers/spatialAnalyticsController');

router.get('/map-data', getMapData);
router.get('/regional-stats', getRegionalStats);
router.get('/hotspots', protect, authorize('teacher', 'admin'), analyzeHotspots);

module.exports = router;