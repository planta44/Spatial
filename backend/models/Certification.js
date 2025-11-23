const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Certificate Details
  certificateName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  certificateType: {
    type: DataTypes.ENUM('course-completion', 'skill-mastery', 'teacher-certification', 'policy-training'),
    allowNull: false
  },
  description: DataTypes.TEXT,
  
  // Requirements
  requirements: {
    type: DataTypes.JSONB,
    defaultValue: {
      coursesRequired: [],
      minimumScore: 80,
      practicalTasks: [],
      timeFrame: null
    }
  },
  
  // Certificate Data
  certificateTemplate: {
    type: DataTypes.TEXT,
    comment: 'HTML template for certificate generation'
  },
  validityPeriod: {
    type: DataTypes.INTEGER,
    comment: 'Validity in months, null for lifetime'
  },
  
  // Issuer Information
  issuingInstitution: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issuedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Analytics
  totalIssued: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'certifications',
  timestamps: true,
  indexes: [
    { fields: ['certificate_type'] },
    { fields: ['is_active'] },
    { fields: ['issued_by_id'] }
  ]
});

module.exports = Certification;
