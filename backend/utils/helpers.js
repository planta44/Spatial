const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'spatial-ai-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

const getPagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  return { skip, limit: limitNum, page: pageNum };
};

const formatPaginationResponse = (items, total, page, limit) => {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

  return {
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

const successResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const errorResponse = (res, statusCode, message, extra = {}) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
};

module.exports = {
  generateToken,
  getPagination,
  formatPaginationResponse,
  successResponse,
  errorResponse,
};

