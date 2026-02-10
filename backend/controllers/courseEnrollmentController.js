const CourseEnrollment = require('../models/CourseEnrollment');
const { errorResponse, successResponse } = require('../utils/helpers');

// @desc    Get current user's enrollments
// @route   GET /api/course-enrollments/me
// @access  Private
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, 200, 'Enrollments retrieved', { enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return errorResponse(res, 500, 'Error fetching enrollments');
  }
};

// @desc    Enroll current user in a course
// @route   POST /api/course-enrollments
// @access  Private
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body || {};

    if (!courseId) {
      return errorResponse(res, 400, 'courseId is required');
    }

    const [enrollment, created] = await CourseEnrollment.findOrCreate({
      where: { userId: req.user.id, courseId },
      defaults: {
        status: 'enrolled',
        progress: 0,
        lastAccessedAt: new Date()
      }
    });

    if (!created) {
      enrollment.status = 'enrolled';
      enrollment.lastAccessedAt = new Date();
      if (enrollment.progress === null || enrollment.progress === undefined) {
        enrollment.progress = 0;
      }
      if (enrollment.completedAt) {
        enrollment.completedAt = null;
      }
      await enrollment.save();
    }

    return successResponse(
      res,
      created ? 201 : 200,
      created ? 'Course enrolled' : 'Course enrollment refreshed',
      { enrollment }
    );
  } catch (error) {
    console.error('Enroll course error:', error);
    return errorResponse(res, 500, 'Error enrolling in course');
  }
};

// @desc    Update enrollment progress or status
// @route   PUT /api/course-enrollments/:courseId
// @access  Private
const updateEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, status, lastAccessedAt } = req.body || {};

    const enrollment = await CourseEnrollment.findOne({
      where: { userId: req.user.id, courseId }
    });

    if (!enrollment) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    if (Number.isFinite(Number(progress))) {
      enrollment.progress = Math.max(0, Math.min(100, Number(progress)));
    }

    if (status) {
      enrollment.status = status;
      if (status === 'completed') {
        enrollment.completedAt = new Date();
      }
    }

    if (lastAccessedAt) {
      enrollment.lastAccessedAt = new Date(lastAccessedAt);
    } else {
      enrollment.lastAccessedAt = new Date();
    }

    await enrollment.save();

    return successResponse(res, 200, 'Enrollment updated', { enrollment });
  } catch (error) {
    console.error('Update enrollment error:', error);
    return errorResponse(res, 500, 'Error updating enrollment');
  }
};

// @desc    Unenroll current user
// @route   DELETE /api/course-enrollments/:courseId
// @access  Private
const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await CourseEnrollment.findOne({
      where: { userId: req.user.id, courseId }
    });

    if (!enrollment) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    await enrollment.destroy();

    return successResponse(res, 200, 'Enrollment removed');
  } catch (error) {
    console.error('Unenroll course error:', error);
    return errorResponse(res, 500, 'Error removing enrollment');
  }
};

module.exports = {
  getMyEnrollments,
  enrollCourse,
  updateEnrollment,
  unenrollCourse
};
