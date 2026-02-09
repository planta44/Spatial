const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const { connectDB } = require('./config/database');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const policyRoutes = require('./routes/policies');
const pageContentRoutes = require('./routes/pageContents');
const spatialRoutes = require('./routes/spatial');
const spatialAnalyticsRoutes = require('./routes/spatialAnalytics');
const compositionRoutes = require('./routes/compositions');
const spatialProjectRoutes = require('./routes/spatialProjects');
const curriculumRoutes = require('./routes/curriculum');
const transcriptionRoutes = require('./routes/transcription');

const app = express();

const getApiBaseUrl = (port) => {
  if (process.env.PUBLIC_API_URL) return process.env.PUBLIC_API_URL;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  if (process.env.RENDER_SERVICE_URL) return process.env.RENDER_SERVICE_URL;
  return `http://localhost:${port}`;
};

const ensureAdminUser = async () => {
  const shouldSeed = process.env.SEED_ADMIN !== 'false';
  if (!shouldSeed) return;

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@spatialai.edu').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Spatial AI Admin';
  const isProduction = process.env.NODE_ENV === 'production';
  const shouldResetPassword = !isProduction && process.env.RESET_ADMIN_PASSWORD !== 'false';

  const [admin, created] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      name: adminName,
      password: adminPassword,
      role: 'admin',
      isActive: true
    }
  });

  if (!created) {
    let needsSave = false;

    if (admin.role !== 'admin') {
      admin.role = 'admin';
      needsSave = true;
    }

    if (!admin.isActive) {
      admin.isActive = true;
      needsSave = true;
    }

    if (shouldResetPassword) {
      admin.password = adminPassword;
      needsSave = true;
    }

    if (!admin.name) {
      admin.name = adminName;
      needsSave = true;
    }

    if (needsSave) {
      await admin.save();
    }
  }

  console.log(`✅ Admin user ready: ${adminEmail}`);
};

// Connect to database and sync models
connectDB()
  .then(async () => {
    console.log('✅ Database connected successfully');
    await ensureAdminUser();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/page-contents', pageContentRoutes);
app.use('/api/spatial', spatialRoutes);
app.use('/api/spatial-analytics', spatialAnalyticsRoutes);
app.use('/api/compositions', compositionRoutes);
app.use('/api/spatial-projects', spatialProjectRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/transcription', transcriptionRoutes);

console.log('✅ All routes registered including /api/transcription');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Spatial AI API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Spatial AI for Music Teacher Training API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      resources: '/api/resources',
      policies: '/api/policies',
      spatial: '/api/spatial',
      spatialAnalytics: '/api/spatial-analytics',
      compositions: '/api/compositions',
      spatialProjects: '/api/spatial-projects',
      curriculum: '/api/curriculum',
      transcription: '/api/transcription',
    }
  });
});

// 404 handler (must come BEFORE error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be LAST)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🚀 Spatial AI API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: ${getApiBaseUrl(PORT)}`);
  console.log(`\n✅ Server started successfully!\n`);
});