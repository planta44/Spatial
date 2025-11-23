const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegionAnalytics = sequelize.define('RegionAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  country: { type: DataTypes.STRING, allowNull: false },
  region: { type: DataTypes.STRING, allowNull: false },
  
  // Geographic center
  centerLat: DataTypes.DECIMAL(10, 8),
  centerLon: DataTypes.DECIMAL(11, 8),
  
  // Metrics
  totalArtists: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalStreams: { type: DataTypes.BIGINT, defaultValue: 0 },
  averageRoyalty: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  
  // Policy & Education
  hasPolicyProgram: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasTrainingCenter: { type: DataTypes.BOOLEAN, defaultValue: false },
  registrationCenters: { type: DataTypes.INTEGER, defaultValue: 0 },
  
  // Calculated insights
  performanceScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  policyImpactScore: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  
  analyticsData: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  tableName: 'region_analytics',
  timestamps: true,
  indexes: [
    { fields: ['country'] },
    { fields: ['performance_score'] }
  ]
});

module.exports = RegionAnalytics;