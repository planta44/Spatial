const SpatialAudio = require('../models/SpatialAudio');
const { getPagination, formatPaginationResponse, errorResponse, successResponse } = require('../utils/helpers');

// @desc    Get all spatial audio files
// @route   GET /api/spatial
// @access  Public
const getSpatialAudios = async (req, res) => {
  try {
    const { page = 1, limit = 10, format, category, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const query = { isPublic: true };

    if (format) query.format = format;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const spatialAudios = await SpatialAudio.find(query)
      .populate('owner', 'name university avatar')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await SpatialAudio.countDocuments(query);

    const response = formatPaginationResponse(spatialAudios, total, pageNum, limitNum);

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Get spatial audios error:', error);
    errorResponse(res, 500, 'Error fetching spatial audio files');
  }
};

// @desc    Get single spatial audio
// @route   GET /api/spatial/:id
// @access  Public
const getSpatialAudio = async (req, res) => {
  try {
    const spatialAudio = await SpatialAudio.findById(req.params.id)
      .populate('owner', 'name university avatar email')
      .populate('resource', 'title category')
      .populate('comments.user', 'name avatar');

    if (!spatialAudio) {
      return errorResponse(res, 404, 'Spatial audio not found');
    }

    // Increment views
    spatialAudio.views += 1;
    await spatialAudio.save();

    successResponse(res, 200, 'Spatial audio retrieved', { spatialAudio });
  } catch (error) {
    console.error('Get spatial audio error:', error);
    errorResponse(res, 500, 'Error fetching spatial audio');
  }
};

// @desc    Create new spatial audio
// @route   POST /api/spatial
// @access  Private
const createSpatialAudio = async (req, res) => {
  try {
    const spatialAudioData = {
      ...req.body,
      owner: req.user.id
    };

    const spatialAudio = await SpatialAudio.create(spatialAudioData);

    successResponse(res, 201, 'Spatial audio created successfully', { spatialAudio });
  } catch (error) {
    console.error('Create spatial audio error:', error);
    errorResponse(res, 500, error.message || 'Error creating spatial audio');
  }
};

// @desc    Update spatial audio
// @route   PUT /api/spatial/:id
// @access  Private (Owner/Admin)
const updateSpatialAudio = async (req, res) => {
  try {
    const spatialAudio = await SpatialAudio.findById(req.params.id);

    if (!spatialAudio) {
      return errorResponse(res, 404, 'Spatial audio not found');
    }

    // Check ownership
    if (spatialAudio.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to update this spatial audio');
    }

    const updatedSpatialAudio = await SpatialAudio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    successResponse(res, 200, 'Spatial audio updated successfully', { spatialAudio: updatedSpatialAudio });
  } catch (error) {
    console.error('Update spatial audio error:', error);
    errorResponse(res, 500, 'Error updating spatial audio');
  }
};

// @desc    Delete spatial audio
// @route   DELETE /api/spatial/:id
// @access  Private (Owner/Admin)
const deleteSpatialAudio = async (req, res) => {
  try {
    const spatialAudio = await SpatialAudio.findById(req.params.id);

    if (!spatialAudio) {
      return errorResponse(res, 404, 'Spatial audio not found');
    }

    // Check ownership
    if (spatialAudio.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to delete this spatial audio');
    }

    await spatialAudio.deleteOne();

    successResponse(res, 200, 'Spatial audio deleted successfully');
  } catch (error) {
    console.error('Delete spatial audio error:', error);
    errorResponse(res, 500, 'Error deleting spatial audio');
  }
};

// @desc    Like spatial audio
// @route   POST /api/spatial/:id/like
// @access  Private
const likeSpatialAudio = async (req, res) => {
  try {
    const spatialAudio = await SpatialAudio.findById(req.params.id);

    if (!spatialAudio) {
      return errorResponse(res, 404, 'Spatial audio not found');
    }

    spatialAudio.likes += 1;
    await spatialAudio.save();

    successResponse(res, 200, 'Liked successfully', { likes: spatialAudio.likes });
  } catch (error) {
    console.error('Like spatial audio error:', error);
    errorResponse(res, 500, 'Error liking spatial audio');
  }
};

// @desc    Add comment to spatial audio
// @route   POST /api/spatial/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return errorResponse(res, 400, 'Comment text is required');
    }

    const spatialAudio = await SpatialAudio.findById(req.params.id);

    if (!spatialAudio) {
      return errorResponse(res, 404, 'Spatial audio not found');
    }

    spatialAudio.comments.push({
      user: req.user.id,
      text,
      timestamp: Date.now()
    });

    await spatialAudio.save();

    const updatedSpatialAudio = await SpatialAudio.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    successResponse(res, 201, 'Comment added successfully', { 
      comments: updatedSpatialAudio.comments 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    errorResponse(res, 500, 'Error adding comment');
  }
};

// @desc    Analyze spatial audio (mock analysis)
// @route   POST /api/spatial/:id/analyze
// @access  Private
const analyzeSpatialAudio = async (req, res) => {
  try {
    const spatialAudio = await SpatialAudio.findById(req.params.id);

    if (!spatialAudio) {
      return errorResponse(res, 404, 'Spatial audio not found');
    }

    // Check ownership
    if (spatialAudio.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to analyze this spatial audio');
    }

    // Mock analysis data (in production, this would use actual audio processing)
    const mockAnalysis = {
      frequencyData: Array.from({ length: 128 }, () => Math.random() * 255),
      waveformData: Array.from({ length: 256 }, () => Math.random() * 2 - 1),
      spectralCentroid: Math.random() * 5000 + 1000,
      zeroCrossingRate: Math.random() * 0.1,
      rms: Math.random() * 0.5,
      peakAmplitude: Math.random() * 0.9 + 0.1,
      dynamicRange: Math.random() * 30 + 40,
      spatialWidth: Math.random() * 180,
      localization: {
        azimuth: Math.random() * 360,
        elevation: Math.random() * 180 - 90,
        distance: Math.random() * 10
      }
    };

    spatialAudio.analysis = mockAnalysis;
    await spatialAudio.save();

    successResponse(res, 200, 'Analysis completed', { analysis: mockAnalysis });
  } catch (error) {
    console.error('Analyze spatial audio error:', error);
    errorResponse(res, 500, 'Error analyzing spatial audio');
  }
};

// @desc    Get spatial audio by format
// @route   GET /api/spatial/format/:format
// @access  Public
const getSpatialAudioByFormat = async (req, res) => {
  try {
    const { format } = req.params;
    const { limit = 10 } = req.query;

    const spatialAudios = await SpatialAudio.find({ 
      format, 
      isPublic: true 
    })
      .populate('owner', 'name university')
      .limit(parseInt(limit))
      .sort({ views: -1 });

    successResponse(res, 200, `Spatial audios in ${format} format`, { 
      count: spatialAudios.length,
      spatialAudios 
    });
  } catch (error) {
    console.error('Get spatial audio by format error:', error);
    errorResponse(res, 500, 'Error fetching spatial audios');
  }
};

module.exports = {
  getSpatialAudios,
  getSpatialAudio,
  createSpatialAudio,
  updateSpatialAudio,
  deleteSpatialAudio,
  likeSpatialAudio,
  addComment,
  analyzeSpatialAudio,
  getSpatialAudioByFormat
};