const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Policy = sequelize.define('Policy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Policy title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: [0, 5000]
    }
  },
  category: {
    type: DataTypes.ENUM('curriculum', 'assessment', 'infrastructure', 'training', 'quality-assurance', 'technology'),
    allowNull: false
  },
  scope: {
    type: DataTypes.ENUM('national', 'regional', 'institutional'),
    allowNull: false
  },
  universities: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  objectives: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  requirements: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  resources: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  budget: {
    type: DataTypes.JSONB,
    defaultValue: {
      estimated: 0,
      allocated: 0,
      spent: 0,
      currency: 'KES'
    }
  },
  timeline: {
    type: DataTypes.JSONB,
    defaultValue: {
      startDate: null,
      endDate: null,
      milestones: []
    }
  },
  stakeholders: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  impactMetrics: {
    type: DataTypes.JSONB,
    defaultValue: {
      studentsReached: 0,
      teachersTrained: 0,
      universitiesInvolved: 0,
      satisfactionRating: 0
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'under-review', 'archived'),
    defaultValue: 'draft'
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lastReviewedDate: {
    type: DataTypes.DATE
  },
  nextReviewDate: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'policies',
  timestamps: true,
  indexes: [
    { fields: ['category', 'status'] },
    { fields: ['scope'] },
    { fields: ['created_by_id'] }
  ]
});

module.exports = Policy;