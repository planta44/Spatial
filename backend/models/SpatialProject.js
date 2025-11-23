const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpatialProject = sequelize.define('SpatialProject', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  
  // Audio Files and Tracks
  audioTracks: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of audio track objects with file URLs and metadata'
  },
  trackCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Spatial Configuration
  spatialConfig: {
    type: DataTypes.JSONB,
    defaultValue: {
      roomSize: { width: 10, height: 3, depth: 10 },
      listenerPosition: { x: 0, y: 0, z: 0 },
      reverbSettings: { wetness: 0.3, roomType: 'medium' },
      masterVolume: 1.0
    }
  },
  
  // 3D Sound Object Positions
  soundObjects: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of sound objects with 3D positions and properties'
  },
  
  // Web Audio API Settings
  audioSettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      sampleRate: 44100,
      bufferSize: 4096,
      binauralMode: true,
      hrtfEnabled: true
    }
  },
  
  // Project State
  projectData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Complete project state for saving/loading'
  },
  
  // Educational Context
  courseId: {
    type: DataTypes.UUID,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  assignmentId: {
    type: DataTypes.UUID,
    comment: 'If this is part of an assignment'
  },
  
  // Metadata
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  collaborators: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'in-progress', 'completed', 'shared'),
    defaultValue: 'draft'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Analytics
  playCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastPlayed: {
    type: DataTypes.DATE
  },
  averageSessionTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'In seconds'
  }
}, {
  tableName: 'spatial_projects',
  timestamps: true,
  indexes: [
    { fields: ['author_id'] },
    { fields: ['course_id'] },
    { fields: ['status'] },
    { fields: ['is_public'] }
  ]
});

module.exports = SpatialProject;
