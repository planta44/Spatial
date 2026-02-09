const Resource = require('../models/Resource');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPagination, formatPaginationResponse, errorResponse, successResponse } = require('../utils/helpers');
const { cloudinaryEnabled, uploadBuffer } = require('../utils/cloudinary');

const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getResourceUploadDestination = (file) => {
  if (file.mimetype.startsWith('image/')) {
    return path.join('uploads', 'resources', 'images');
  }
  if (file.mimetype === 'application/pdf') {
    return path.join('uploads', 'resources', 'pdfs');
  }
  return path.join('uploads', 'resources', 'files');
};

const storage = cloudinaryEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const dest = getResourceUploadDestination(file);
        ensureUploadDir(dest);
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    });

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = file.mimetype === 'application/pdf';
    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

const getCloudinaryFolder = (file) => {
  if (file.mimetype.startsWith('image/')) {
    return 'spatial-ai/resources/images';
  }
  if (file.mimetype === 'application/pdf') {
    return 'spatial-ai/resources/pdfs';
  }
  return 'spatial-ai/resources/files';
};

const getCloudinaryResourceType = (file) => {
  if (file.mimetype.startsWith('image/')) {
    return 'image';
  }
  return 'raw';
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, type, search } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const where = { isPublished: true };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    const resources = await Resource.findAll({
      where,
      offset: skip,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });

    const total = await Resource.count({ where });

    const response = formatPaginationResponse(resources, total, pageNum, limitNum);

    successResponse(res, 200, 'Resources retrieved', response);
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
    const resource = await Resource.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Increment views
    resource.views = (resource.views || 0) + 1;
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
      authorId: req.user.id,
      authorName: req.user.name || req.body.authorName || null
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
    const resource = await Resource.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Check ownership
    if (String(resource.authorId) !== String(req.user.id) && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to update this resource');
    }

    const updatedResource = await resource.update(req.body);

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
    const resource = await Resource.findByPk(req.params.id);

    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Check ownership
    if (String(resource.authorId) !== String(req.user.id) && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Not authorized to delete this resource');
    }

    await resource.destroy();

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

    const resource = await Resource.findByPk(req.params.id);

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

    const resources = await Resource.findAll({
      where: { category, isPublished: true },
      limit: parseInt(limit, 10),
      order: [['createdAt', 'DESC']]
    });

    successResponse(res, 200, `Resources in ${category}`, {
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Get resources by category error:', error);
    errorResponse(res, 500, 'Error fetching resources');
  }
};

// @desc    Get all resources for admin
// @route   GET /api/resources/admin
// @access  Private (Teacher/Admin)
const getResourcesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, difficulty, type, search, isPublished } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const where = {};

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true' || isPublished === true;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    const resources = await Resource.findAll({
      where,
      offset: skip,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });

    const total = await Resource.count({ where });
    const response = formatPaginationResponse(resources, total, pageNum, limitNum);

    successResponse(res, 200, 'Admin resources retrieved', response);
  } catch (error) {
    console.error('Get admin resources error:', error);
    errorResponse(res, 500, 'Error fetching admin resources');
  }
};

// @desc    Upload resource asset (image or PDF)
// @route   POST /api/resources/upload
// @access  Private (Teacher/Admin)
const uploadResourceAsset = [
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return errorResponse(res, 400, 'No file uploaded');
    }

    if (cloudinaryEnabled) {
      try {
        const result = await uploadBuffer({
          buffer: req.file.buffer,
          folder: getCloudinaryFolder(req.file),
          resourceType: getCloudinaryResourceType(req.file),
          originalFilename: req.file.originalname
        });

        return successResponse(res, 201, 'File uploaded successfully', {
          url: result.secure_url,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          provider: 'cloudinary',
          publicId: result.public_id
        });
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return errorResponse(res, 500, 'Cloud upload failed');
      }
    }

    const normalizedPath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `/${normalizedPath}`;

    return successResponse(res, 201, 'File uploaded successfully', {
      url: fileUrl,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      provider: 'local'
    });
  }
];

module.exports = {
  getResources,
  getResourcesAdmin,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  rateResource,
  getResourcesByCategory,
  uploadResourceAsset
};