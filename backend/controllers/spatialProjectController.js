const SpatialProject = require('../models/SpatialProject');
const Course = require('../models/Course');
const { successResponse, errorResponse } = require('../utils/helpers');
const multer = require('multer');
const path = require('path');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|flac|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Create new spatial project
const createProject = async (req, res) => {
  try {
    const { title, description, courseId } = req.body;
    const userId = req.user.id;

    const project = await SpatialProject.create({
      title,
      description,
      courseId,
      authorId: userId,
      status: 'draft'
    });

    successResponse(res, 201, 'Spatial project created', { project });
  } catch (error) {
    console.error('Create project error:', error);
    errorResponse(res, 500, 'Error creating spatial project');
  }
};

// Upload audio tracks to project
const uploadAudioTracks = [
  upload.array('audioTracks', 10), // Max 10 tracks
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const project = await SpatialProject.findByPk(id);

      if (!project) {
        return errorResponse(res, 404, 'Project not found');
      }

      if (project.authorId !== userId) {
        return errorResponse(res, 403, 'Access denied');
      }

      // Process uploaded files
      const audioTracks = req.files.map((file, index) => ({
        id: `track_${Date.now()}_${index}`,
        name: file.originalname,
        filename: file.filename,
        url: `/uploads/audio/${file.filename}`,
        duration: 0, // Would be calculated by audio analysis
        format: path.extname(file.originalname).substring(1),
        size: file.size,
        uploadedAt: new Date()
      }));

      // Update project with new tracks
      const updatedAudioTracks = [...project.audioTracks, ...audioTracks];
      
      await project.update({
        audioTracks: updatedAudioTracks,
        trackCount: updatedAudioTracks.length
      });

      successResponse(res, 200, 'Audio tracks uploaded', {
        project,
        uploadedTracks: audioTracks
      });
    } catch (error) {
      console.error('Upload audio tracks error:', error);
      errorResponse(res, 500, 'Error uploading audio tracks');
    }
  }
];

// Update spatial configuration
const updateSpatialConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { soundObjects, spatialConfig, audioSettings } = req.body;
    const userId = req.user.id;

    const project = await SpatialProject.findByPk(id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.authorId !== userId) {
      return errorResponse(res, 403, 'Access denied');
    }

    const updates = {};
    if (soundObjects) updates.soundObjects = soundObjects;
    if (spatialConfig) updates.spatialConfig = { ...project.spatialConfig, ...spatialConfig };
    if (audioSettings) updates.audioSettings = { ...project.audioSettings, ...audioSettings };

    await project.update(updates);

    successResponse(res, 200, 'Spatial configuration updated', { project });
  } catch (error) {
    console.error('Update spatial config error:', error);
    errorResponse(res, 500, 'Error updating spatial configuration');
  }
};

// Save complete project state
const saveProjectState = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectData } = req.body;
    const userId = req.user.id;

    const project = await SpatialProject.findByPk(id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.authorId !== userId) {
      return errorResponse(res, 403, 'Access denied');
    }

    await project.update({
      projectData,
      status: 'in-progress'
    });

    successResponse(res, 200, 'Project state saved', { project });
  } catch (error) {
    console.error('Save project state error:', error);
    errorResponse(res, 500, 'Error saving project state');
  }
};

// Get user's spatial projects
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { authorId: userId };
    if (status) {
      whereClause.status = status;
    }

    const projects = await SpatialProject.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    successResponse(res, 200, 'Projects retrieved', {
      projects: projects.rows,
      pagination: {
        total: projects.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(projects.count / limit)
      }
    });
  } catch (error) {
    console.error('Get user projects error:', error);
    errorResponse(res, 500, 'Error retrieving projects');
  }
};

// Get project details
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await SpatialProject.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    // Check access
    if (project.authorId !== req.user.id && !project.isPublic) {
      return errorResponse(res, 403, 'Access denied');
    }

    // Update play count if viewing
    if (req.method === 'GET') {
      await project.increment('playCount');
      await project.update({ lastPlayed: new Date() });
    }

    successResponse(res, 200, 'Project details retrieved', { project });
  } catch (error) {
    console.error('Get project error:', error);
    errorResponse(res, 500, 'Error retrieving project');
  }
};

// Delete spatial project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await SpatialProject.findByPk(id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.authorId !== userId) {
      return errorResponse(res, 403, 'Access denied');
    }

    // TODO: Delete associated audio files from filesystem
    
    await project.destroy();

    successResponse(res, 200, 'Project deleted successfully');
  } catch (error) {
    console.error('Delete project error:', error);
    errorResponse(res, 500, 'Error deleting project');
  }
};

// Share/publish project
const shareProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    const userId = req.user.id;

    const project = await SpatialProject.findByPk(id);

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (project.authorId !== userId) {
      return errorResponse(res, 403, 'Access denied');
    }

    await project.update({
      isPublic: Boolean(isPublic),
      status: isPublic ? 'shared' : project.status
    });

    successResponse(res, 200, 'Project sharing updated', { project });
  } catch (error) {
    console.error('Share project error:', error);
    errorResponse(res, 500, 'Error updating project sharing');
  }
};

// Get public spatial projects for inspiration
const getPublicProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { isPublic: true };

    const projects = await SpatialProject.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['playCount', 'DESC'], ['createdAt', 'DESC']],
      attributes: [
        'id', 'title', 'description', 'trackCount', 'playCount',
        'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    successResponse(res, 200, 'Public projects retrieved', {
      projects: projects.rows,
      pagination: {
        total: projects.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(projects.count / limit)
      }
    });
  } catch (error) {
    console.error('Get public projects error:', error);
    errorResponse(res, 500, 'Error retrieving public projects');
  }
};

module.exports = {
  createProject,
  uploadAudioTracks,
  updateSpatialConfig,
  saveProjectState,
  getUserProjects,
  getProject,
  deleteProject,
  shareProject,
  getPublicProjects
};
