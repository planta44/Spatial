const Resource = require('../models/Resource');
const { getPagination, formatPaginationResponse, errorResponse, successResponse } = require('../utils/helpers');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, type, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Build query
    const query = { isPublished: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query
    const resources = await Resource.find(query)
      .populate('author', 'name university')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Resource.countDocuments(query);

    const response = formatPaginationResponse(resources, total, pageNum, limitNum);

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Get resources error:', error);
    errorResponse(res, 500, 'Error fetching resources');
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'name university avatar')
      .populate('prerequisites', 'title difficulty');

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Increment views
    resource.views += 1;
    await resource.save();

    successResponse(res, 200, 'Resource retrieved', { resource });
  } catch (error) {
    console.error('Get resource error:', error);
    errorResponse(res, 500, 'Error fetching resource');
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Teacher/Admin)
const createResource = async (req, res) => {
  try {
    const resourceData = {
      ...req.body,
      author: req.user.id
    };

    const resource = await Resource.create(resourceData);

    successResponse(res, 201, 'Resource created successfully', { resource });
  } catch (error) {
    console.error('Create resource error:', error);
    errorResponse(res, 500, error.message || 'Error creating resource');
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Owner/Admin)
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Check ownership
    if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to update this resource');
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, 'Resource updated successfully', { resource: updatedResource });
  } catch (error) {
    console.error('Update resource error:', error);
    errorResponse(res, 500, 'Error updating resource');
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Owner/Admin)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Check ownership
    if (resource.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to delete this resource');
    }

    await resource.deleteOne();

    successResponse(res, 200, 'Resource deleted successfully');
  } catch (error) {
    console.error('Delete resource error:', error);
    errorResponse(res, 500, 'Error deleting resource');
  }
};

// @desc    Rate a resource
// @route   POST /api/resources/:id/rate
// @access  Private
const rateResource = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 400, 'Rating must be between 1 and 5');
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Calculate new average
    const currentTotal = resource.rating.average * resource.rating.count;
    const newCount = resource.rating.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    resource.rating.average = newAverage;
    resource.rating.count = newCount;

    await resource.save();

    successResponse(res, 200, 'Rating submitted successfully', { 
      rating: resource.rating 
    });
  } catch (error) {
    console.error('Rate resource error:', error);
    errorResponse(res, 500, 'Error rating resource');
  }
};

// @desc    Get resources by category
// @route   GET /api/resources/category/:category
// @access  Public
const getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const resources = await Resource.find({ 
      category, 
      isPublished: true 
    })
      .populate('author', 'name university')
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 });

    successResponse(res, 200, `Resources in ${category}`, { 
      count: resources.length,
      resources 
    });
  } catch (error) {
    console.error('Get resources by category error:', error);
    errorResponse(res, 500, 'Error fetching resources');
  }
};

module.exports = {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  rateResource,
  getResourcesByCategory
};