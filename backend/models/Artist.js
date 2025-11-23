const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stageName: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: { isEmail: true }
  },
  // Geolocation
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: DataTypes.STRING,
  city: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8),
  location: DataTypes.GEOMETRY('POINT'),
  
  // Streaming platforms
  spotifyId: DataTypes.STRING,
  boomplayId: DataTypes.STRING,
  youtubeChannelId: DataTypes.STRING,
  
  // Metrics
  monthlyListeners: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalStreams: { type: DataTypes.BIGINT, defaultValue: 0 },
  estimatedMonthlyRoyalty: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  
  // Training
  hasCompletedTraining: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasCopyrightRegistration: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  tableName: 'artists',
  timestamps: true,
  indexes: [
    { fields: ['country', 'region'] },
    { fields: ['location'], using: 'gist' }
  ]
});

module.exports = Artist;