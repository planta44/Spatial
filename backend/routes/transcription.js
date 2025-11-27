const express = require('express');
const multer = require('multer');

const router = express.Router();

const { optionalAuth } = require('../middleware/auth');
const { transcribePerformance } = require('../controllers/transcriptionController');

const upload = multer({ dest: 'uploads/' });

router.post('/performance', upload.single('audio'), optionalAuth, transcribePerformance);

module.exports = router;
