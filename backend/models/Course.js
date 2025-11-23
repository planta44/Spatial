const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
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
  
  // Course Structure
  category: {
    type: DataTypes.ENUM('ai-composition', 'spatial-audio', 'teacher-training', 'policy', 'research'),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  estimatedHours: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  
  // Content
  modules: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of module objects with lessons, quizzes, resources'
  },
  downloadableResources: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'PDFs, lesson plans, guides, certificates'
  },
  prerequisites: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  
  // Teacher Training Specific
  certificationRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  certificationCriteria: {
    type: DataTypes.JSONB,
    defaultValue: {
      minScore: 80,
      requiredTasks: [],
      timeLimit: null
    }
  },
  
  // Policy & Curriculum
  curriculumStandards: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Kenyan curriculum alignment'
  },
  policyGuidelines: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'FOSS policies, academic integrity, etc.'
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
  universityId: {
    type: DataTypes.UUID,
    references: {
      model: 'universities',
      key: 'id'
    }
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  enrollmentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'courses',
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['difficulty'] },
    { fields: ['author_id'] },
    { fields: ['is_published'] }
  ]
});

module.exports = Course;
