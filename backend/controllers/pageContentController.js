const PageContent = require('../models/PageContent');
const { errorResponse, successResponse } = require('../utils/helpers');

// @desc    Get page content by slug
// @route   GET /api/page-contents/:slug
// @access  Public
const getPageContent = async (req, res) => {
  try {
    const { slug } = req.params;
    const pageContent = await PageContent.findOne({ where: { slug } });

    if (!pageContent) {
      return errorResponse(res, 404, 'Page content not found');
    }

    return successResponse(res, 200, 'Page content retrieved', { pageContent });
  } catch (error) {
    console.error('Get page content error:', error);
    return errorResponse(res, 500, 'Error fetching page content');
  }
};

// @desc    Create or update page content
// @route   PUT /api/page-contents/:slug
// @access  Private (Teacher/Admin)
const upsertPageContent = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body || {};

    if (!slug) {
      return errorResponse(res, 400, 'Slug is required');
    }

    const payload = {
      slug,
      title: title || null,
      content: content || {},
    };

    const existing = await PageContent.findOne({ where: { slug } });
    let pageContent;

    if (existing) {
      pageContent = await existing.update({
        ...payload,
        updatedById: req.user?.id || existing.updatedById,
      });

      return successResponse(res, 200, 'Page content updated', { pageContent });
    }

    pageContent = await PageContent.create({
      ...payload,
      createdById: req.user?.id || null,
      updatedById: req.user?.id || null,
    });

    return successResponse(res, 201, 'Page content created', { pageContent });
  } catch (error) {
    console.error('Upsert page content error:', error);
    return errorResponse(res, 500, 'Error saving page content');
  }
};

module.exports = {
  getPageContent,
  upsertPageContent,
};
