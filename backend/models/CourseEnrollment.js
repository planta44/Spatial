const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'enrolled'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'course_enrollments',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['course_id'] },
    { unique: true, fields: ['user_id', 'course_id'] }
  ]
});

module.exports = CourseEnrollment;
