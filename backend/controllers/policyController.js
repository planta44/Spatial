const Policy = require('../models/Policy');
const { getPagination, formatPaginationResponse, errorResponse, successResponse } = require('../utils/helpers');

// @desc    Get all policies
// @route   GET /api/policies
// @access  Public
const getPolicies = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, scope, status, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Build query
    const query = {};

    if (category) query.category = category;
    if (scope) query.scope = scope;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const policies = await Policy.find(query)
      .populate('createdBy', 'name university')
      .populate('resources', 'title category')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Policy.countDocuments(query);

    const response = formatPaginationResponse(policies, total, pageNum, limitNum);

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Get policies error:', error);
    errorResponse(res, 500, 'Error fetching policies');
  }
};

// @desc    Get single policy
// @route   GET /api/policies/:id
// @access  Public
const getPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('createdBy', 'name university email')
      .populate('resources', 'title category type');

    if (!policy) {
      return errorResponse(res, 404, 'Policy not found');
    }

    successResponse(res, 200, 'Policy retrieved', { policy });
  } catch (error) {
    console.error('Get policy error:', error);
    errorResponse(res, 500, 'Error fetching policy');
  }
};

// @desc    Create new policy
// @route   POST /api/policies
// @access  Private (Admin/Teacher)
const createPolicy = async (req, res) => {
  try {
    const policyData = {
      ...req.body,
      createdBy: req.user.id
    };

    const policy = await Policy.create(policyData);

    successResponse(res, 201, 'Policy created successfully', { policy });
  } catch (error) {
    console.error('Create policy error:', error);
    errorResponse(res, 500, error.message || 'Error creating policy');
  }
};

// @desc    Update policy
// @route   PUT /api/policies/:id
// @access  Private (Owner/Admin)
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return errorResponse(res, 404, 'Policy not found');
    }

    // Check authorization
    if (policy.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to update this policy');
    }

    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, 'Policy updated successfully', { policy: updatedPolicy });
  } catch (error) {
    console.error('Update policy error:', error);
    errorResponse(res, 500, 'Error updating policy');
  }
};

// @desc    Delete policy
// @route   DELETE /api/policies/:id
// @access  Private (Owner/Admin)
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return errorResponse(res, 404, 'Policy not found');
    }

    // Check authorization
    if (policy.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to delete this policy');
    }

    await policy.deleteOne();

    successResponse(res, 200, 'Policy deleted successfully');
  } catch (error) {
    console.error('Delete policy error:', error);
    errorResponse(res, 500, 'Error deleting policy');
  }
};

// @desc    Get policies by university
// @route   GET /api/policies/university/:name
// @access  Public
const getPoliciesByUniversity = async (req, res) => {
  try {
    const { name } = req.params;

    const policies = await Policy.find({
      'universities.name': { $regex: name, $options: 'i' }
    })
      .populate('createdBy', 'name university')
      .sort({ createdAt: -1 });

    successResponse(res, 200, `Policies for ${name}`, { 
      count: policies.length,
      policies 
    });
  } catch (error) {
    console.error('Get policies by university error:', error);
    errorResponse(res, 500, 'Error fetching policies');
  }
};

// @desc    Update university implementation status
// @route   PUT /api/policies/:id/university/:universityId
// @access  Private (Admin)
const updateUniversityStatus = async (req, res) => {
  try {
    const { id, universityId } = req.params;
    const { implementationStatus, notes } = req.body;

    const policy = await Policy.findById(id);

    if (!policy) {
      return errorResponse(res, 404, 'Policy not found');
    }

    // Find and update university
    const university = policy.universities.id(universityId);
    if (!university) {
      return errorResponse(res, 404, 'University not found in policy');
    }

    if (implementationStatus) university.implementationStatus = implementationStatus;
    if (notes) university.notes = notes;
    university.implementationDate = Date.now();

    await policy.save();

    successResponse(res, 200, 'University status updated', { policy });
  } catch (error) {
    console.error('Update university status error:', error);
    errorResponse(res, 500, 'Error updating status');
  }
};

// @desc    Get policy statistics
// @route   GET /api/policies/stats
// @access  Public
const getPolicyStats = async (req, res) => {
  try {
    const stats = await Policy.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget.allocated' },
          totalReached: { $sum: '$impactMetrics.studentsReached' }
        }
      }
    ]);

    const totalPolicies = await Policy.countDocuments();
    const activePolicies = await Policy.countDocuments({ status: 'active' });

    successResponse(res, 200, 'Policy statistics', { 
      totalPolicies,
      activePolicies,
      categoryStats: stats
    });
  } catch (error) {
    console.error('Get policy stats error:', error);
    errorResponse(res, 500, 'Error fetching statistics');
  }
};

module.exports = {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPoliciesByUniversity,
  updateUniversityStatus,
  getPolicyStats
};