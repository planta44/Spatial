const { Sequelize } = require('sequelize');

// Create Sequelize instance with better error handling
let sequelize;
const enableDbLogging = process.env.DB_LOGGING === 'true';
const sslEnabled =
  process.env.DB_SSL === 'true' ||
  process.env.DATABASE_SSL === 'true' ||
  /sslmode=require/i.test(process.env.DATABASE_URL || '');

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

const connectDB = async () => {
  try {
    console.log('🔍 Attempting database connection...');
    console.log(`🔍 DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
    console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
    
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    console.log(`📊 Database: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.split('/').pop().split('?')[0] : process.env.DB_NAME || 'spatial_ai'}`);
    
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