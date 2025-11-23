const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserCertification = sequelize.define('UserCertification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Relationships
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  certificationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'certifications',
      key: 'id'
    }
  },
  
  // Certificate Details
  certificateNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  issuedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiryDate: {
    type: DataTypes.DATE
  },
  
  // Achievement Data
  finalScore: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Final percentage score'
  },
  completedTasks: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of completed task IDs and scores'
  },
  completionTime: {
    type: DataTypes.INTEGER,
    comment: 'Time taken to complete in hours'
  },
  
  // Certificate File
  certificateUrl: {
    type: DataTypes.STRING,
    comment: 'URL to generated PDF certificate'
  },
  certificateHash: {
    type: DataTypes.STRING,
    comment: 'Hash for certificate verification'
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('active', 'expired', 'revoked'),
    defaultValue: 'active'
  },
  
  // Verification
  verificationCode: {
    type: DataTypes.STRING,
    unique: true
  },
  verifiedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verificationDate: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'user_certifications',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['certification_id'] },
    { fields: ['certificate_number'] },
    { fields: ['verification_code'] },
    { fields: ['status'] }
  ]
});

module.exports = UserCertification;
