const { Sequelize } = require('sequelize');

// Create Sequelize instance with better error handling
let sequelize;
const enableDbLogging = process.env.DB_LOGGING === 'true';
const sslEnabled =
  process.env.DB_SSL === 'true' ||
  process.env.DATABASE_SSL === 'true' ||
  /sslmode=require/i.test(process.env.DATABASE_URL || '');
const shouldEnablePostgis =
  process.env.DB_ENABLE_POSTGIS === 'true' ||
  process.env.DB_SYNC === 'true';

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Render PostgreSQL
  console.log('🔌 Using DATABASE_URL for production');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: enableDbLogging ? console.log : false,

    dialectOptions: {
      ssl: sslEnabled ? { require: true, rejectUnauthorized: false } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true
    }
  });
} else {
  // Development: Use individual environment variables
  console.log('🔌 Using individual DB variables for development');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'spatial_ai',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: enableDbLogging ? console.log : false,

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
      }
    }
  );
}

const ensureCoreSchema = async () => {
  const Resource = require('../models/Resource');
  const PageContent = require('../models/PageContent');
  const CourseEnrollment = require('../models/CourseEnrollment');

  try {
    await Resource.sync();
    await PageContent.sync();
    await CourseEnrollment.sync();
  } catch (error) {
    console.warn('⚠️  Core table sync skipped:', error.message);
  }

  const resourceAlterations = [
    "ALTER TABLE resources ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0",
    "ALTER TABLE resources ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb",
    'ALTER TABLE resources ADD COLUMN IF NOT EXISTS author_name VARCHAR(255)',
    "ALTER TABLE resources ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) DEFAULT ''",
    'ALTER TABLE resources ADD COLUMN IF NOT EXISTS author_id UUID',
    'ALTER TABLE resources ADD COLUMN IF NOT EXISTS university VARCHAR(255)',
    "ALTER TABLE resources ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] DEFAULT '{}'::text[]",
    "ALTER TABLE resources ADD COLUMN IF NOT EXISTS spatial_audio_config JSONB DEFAULT '{" +
      "\"enabled\": false, \"format\": null, \"channels\": null}'::jsonb",
    'ALTER TABLE resources ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0',
    'ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false',
    'ALTER TABLE resources ADD COLUMN IF NOT EXISTS published_date TIMESTAMP'
  ];

  for (const statement of resourceAlterations) {
    try {
      await sequelize.query(statement);
    } catch (error) {
      console.warn('⚠️  Resource schema update skipped:', error.message);
    }
  }

  const resourceBackfills = [
    'UPDATE resources SET sort_order = 0 WHERE sort_order IS NULL',
    'UPDATE resources SET is_published = is_public WHERE is_published IS NULL',
    'UPDATE resources SET author_id = created_by WHERE author_id IS NULL AND created_by IS NOT NULL'
  ];

  for (const statement of resourceBackfills) {
    try {
      await sequelize.query(statement);
    } catch (error) {
      console.warn('⚠️  Resource backfill skipped:', error.message);
    }
  }

  const userAlterations = [
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP'
  ];

  for (const statement of userAlterations) {
    try {
      await sequelize.query(statement);
    } catch (error) {
      console.warn('⚠️  User schema update skipped:', error.message);
    }
  }

  const pageContentAlterations = [
    'ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS slug VARCHAR(255)',
    'ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS title VARCHAR(255)',
    "ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb",
    'ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS created_by UUID',
    'ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS updated_by UUID',
    'ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE page_contents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  ];

  for (const statement of pageContentAlterations) {
    try {
      await sequelize.query(statement);
    } catch (error) {
      console.warn('⚠️  Page content schema update skipped:', error.message);
    }
  }

  try {
    await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS page_contents_slug_idx ON page_contents (slug)');
  } catch (error) {
    console.warn('⚠️  Page contents index update skipped:', error.message);
  }
};

const connectDB = async () => {
  try {
    console.log('🔍 Attempting database connection...');
    console.log(`🔍 DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
    console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
    
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    console.log(`📊 Database: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.split('/').pop().split('?')[0] : process.env.DB_NAME || 'spatial_ai'}`);

    if (shouldEnablePostgis) {
      try {
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis');
        console.log('🧭 PostGIS extension ready');
      } catch (error) {
        console.warn('⚠️  PostGIS extension not available:', error.message);
      }
    }
    
    await ensureCoreSchema();

    // Sync all models
    if (process.env.NODE_ENV === 'development' || process.env.DB_SYNC === 'true') {
      if (process.env.DB_SYNC === 'true') {
        console.log('🧱 DB_SYNC enabled: syncing models in production');
      }
      await sequelize.sync({ alter: true });
      console.log('📋 Database models synchronized');
    }
  } catch (error) {
    console.error('❌ PostgreSQL connection error:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Full error:', error);
    console.error('🔍 Environment variables:');
    console.error('  - DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.error('  - DB_HOST:', process.env.DB_HOST || 'NOT SET');
    console.error('  - DB_NAME:', process.env.DB_NAME || 'NOT SET');
    console.error('  - DB_USER:', process.env.DB_USER || 'NOT SET');
    console.error('  - DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };