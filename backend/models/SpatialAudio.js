const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpatialAudio = sequelize.define('SpatialAudio', {
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
    validate: {
      len: [0, 1000]
    }
  },
  audioFileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  format: {
    type: DataTypes.ENUM('stereo', 'binaural', 'ambisonic', 'multi-channel', 'mono'),
    allowNull: false
  },
  channels: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 32
    }
  },
  sampleRate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Sample rate in Hz'
  },
  bitDepth: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Bit depth'
  },
  duration: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Duration in seconds'
  },
  spatialConfig: {
    type: DataTypes.JSONB,
    defaultValue: {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      orientationX: 0,
      orientationY: 0,
      orientationZ: -1,
      distanceModel: 'inverse',
      maxDistance: 10000,
      refDistance: 1,
      rolloffFactor: 1,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0
    }
  },
  analysis: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  visualization: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  category: {
    type: DataTypes.ENUM('lecture', 'performance', 'practice', 'demonstration', 'experiment'),
    defaultValue: 'demonstration'
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resourceId: {
    type: DataTypes.UUID,
    references: {
      model: 'resources',
      key: 'id'
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'spatial_audios',
  timestamps: true,
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['format'] },
    { fields: ['category'] },
    { fields: ['tags'], using: 'gin' }
  ]
});

module.exports = SpatialAudio;