const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPoliciesByUniversity,
  updateUniversityStatus,
  getPolicyStats
} = require('../controllers/policyController');

// Public routes
router.get('/', getPolicies);
router.get('/stats', getPolicyStats);
router.get('/university/:name', getPoliciesByUniversity);
router.get('/:id', getPolicy);

// Protected routes
router.post('/', protect, authorize('teacher', 'admin'), createPolicy);
router.put('/:id', protect, updatePolicy);
router.delete('/:id', protect, deletePolicy);
router.put('/:id/university/:universityId', protect, authorize('admin'), updateUniversityStatus);

module.exports = router;