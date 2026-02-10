const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  getMyEnrollments,
  enrollCourse,
  updateEnrollment,
  unenrollCourse
} = require('../controllers/courseEnrollmentController');

router.get('/me', protect, getMyEnrollments);
router.post('/', protect, enrollCourse);
router.put('/:courseId', protect, updateEnrollment);
router.delete('/:courseId', protect, unenrollCourse);

module.exports = router;
