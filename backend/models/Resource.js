const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: [0, 2000]
    }
  },
  type: {
    type: DataTypes.ENUM('module', 'video', 'audio', 'document', 'interactive', 'assessment'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('spatial-audio', 'pedagogy', 'theory', 'practical', 'technology', 'policy'),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  university: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  prerequisites: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  learningOutcomes: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  spatialAudioConfig: {
    type: DataTypes.JSONB,
    defaultValue: {
      enabled: false,
      format: null,
      channels: null
    }
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.JSONB,
    defaultValue: {
      average: 0,
      count: 0
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedDate: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'resources',
  timestamps: true,
  indexes: [
    { fields: ['category', 'difficulty'] },
    { fields: ['author_id'] },
    { fields: ['tags'], using: 'gin' }
  ]
});

module.exports = Resource;