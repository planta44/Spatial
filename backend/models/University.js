const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const University = sequelize.define('University', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Basic Information
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortName: {
    type: DataTypes.STRING,
    comment: 'e.g., UoN, KU, JKUAT'
  },
  description: DataTypes.TEXT,
  
  // Location
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Kenya'
  },
  county: {
    type: DataTypes.STRING,
    comment: 'Kenyan county'
  },
  city: {
    type: DataTypes.STRING
  },
  address: DataTypes.TEXT,
  
  // Contact Information
  website: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  
  // Infrastructure Data
  infrastructureInfo: {
    type: DataTypes.JSONB,
    defaultValue: {
      hasComputerLab: false,
      computerCount: 0,
      hasAudioStudio: false,
      hasInternetAccess: true,
      bandwidthMbps: 0,
      softwareAvailable: []
    }
  },
  
  // Program Information
  musicProgramInfo: {
    type: DataTypes.JSONB,
    defaultValue: {
      hasPreServiceTeaching: false,
      hasInServiceTraining: false,
      studentsPerYear: 0,
      facultyCount: 0,
      currentCurriculum: 'traditional'
    }
  },
  
  // Platform Usage
  subscriptionType: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'institutional'),
    defaultValue: 'free'
  },
  subscriptionExpiry: DataTypes.DATE,
  
  // Settings
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      branding: {
        logo: null,
        colors: { primary: '#1e40af', secondary: '#64748b' }
      },
      policies: {
        requireApproval: true,
        allowPublicSharing: false,
        dataRetentionDays: 365
      }
    }
  },
  
  // Analytics
  analytics: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalUsers: 0,
      totalCourses: 0,
      totalProjects: 0,
      lastActivityDate: null
    }
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'universities',
  timestamps: true,
  indexes: [
    { fields: ['country'] },
    { fields: ['county'] },
    { fields: ['subscription_type'] },
    { fields: ['is_active'] }
  ]
});

module.exports = University;
