const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Composition = sequelize.define('Composition', {
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
  
  // Composition Data
  musicXML: {
    type: DataTypes.TEXT,
    comment: 'MuseScore compatible XML'
  },
  midiData: {
    type: DataTypes.BLOB,
    comment: 'MIDI file binary data'
  },
  audioFileUrl: {
    type: DataTypes.STRING,
    comment: 'Generated or uploaded audio file'
  },
  
  // AI Generation Parameters
  aiModel: {
    type: DataTypes.ENUM('magenta', 'rule-based', 'chord-generator', 'melody-generator'),
    defaultValue: 'rule-based'
  },
  generationParams: {
    type: DataTypes.JSONB,
    defaultValue: {
      key: 'C major',
      tempo: 120,
      timeSignature: '4/4',
      style: 'classical',
      complexity: 'beginner'
    }
  },
  
  // Analysis Results
  harmonyAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  suggestedImprovements: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  
  // Educational Context
  courseId: {
    type: DataTypes.UUID,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Status
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completionStatus: {
    type: DataTypes.ENUM('draft', 'in-progress', 'completed', 'submitted'),
    defaultValue: 'draft'
  },
  
  // Metadata
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  }
}, {
  tableName: 'compositions',
  timestamps: true,
  indexes: [
    { fields: ['author_id'] },
    { fields: ['course_id'] },
    { fields: ['ai_model'] },
    { fields: ['completion_status'] }
  ]
});

module.exports = Composition;
