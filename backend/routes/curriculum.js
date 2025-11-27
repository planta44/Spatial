const express = require('express');
const router = express.Router();

const { optionalAuth } = require('../middleware/auth');
const { generateCurriculum } = require('../controllers/curriculumController');

router.post('/generate', optionalAuth, generateCurriculum);

module.exports = router;

