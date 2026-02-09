const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PageContent = sequelize.define('PageContent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedById: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'updated_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'page_contents',
  timestamps: true,
  indexes: [
    { fields: ['slug'], unique: true }
  ]
});

module.exports = PageContent;
