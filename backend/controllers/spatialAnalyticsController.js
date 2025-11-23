const Artist = require('../models/Artist');
const RegionAnalytics = require('../models/RegionAnalytics');
const { sequelize } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get map data for visualization
const getMapData = async (req, res) => {
  try {
    const { country } = req.query;

    const whereClause = country ? { country } : {};

    const artists = await Artist.findAll({
      where: whereClause,
      attributes: [
        'id', 'name', 'stageName', 'country', 'region', 'city',
        'latitude', 'longitude', 'monthlyListeners', 'estimatedMonthlyRoyalty',
        'hasCompletedTraining', 'hasCopyrightRegistration'
      ]
    });

    const mapPoints = artists.map(artist => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(artist.longitude), parseFloat(artist.latitude)]
      },
      properties: {
        id: artist.id,
        name: artist.name || artist.stageName,
        country: artist.country,
        region: artist.region,
        city: artist.city,
        listeners: artist.monthlyListeners,
        royalty: artist.estimatedMonthlyRoyalty,
        trained: artist.hasCompletedTraining,
        registered: artist.hasCopyrightRegistration
      }
    })).filter(point => point.geometry.coordinates[0] && point.geometry.coordinates[1]);

    successResponse(res, 200, 'Map data retrieved', {
      type: 'FeatureCollection',
      features: mapPoints
    });
  } catch (error) {
    console.error('Get map data error:', error);
    errorResponse(res, 500, 'Error fetching map data');
  }
};

// Get regional statistics
const getRegionalStats = async (req, res) => {
  try {
    const stats = await RegionAnalytics.findAll({
      order: [['totalStreams', 'DESC']]
    });

    successResponse(res, 200, 'Regional statistics retrieved', { stats });
  } catch (error) {
    console.error('Get regional stats error:', error);
    errorResponse(res, 500, 'Error fetching regional statistics');
  }
};
// Analyze hotspots using clustering
const analyzeHotspots = async (req, res) => {
  try {
    const artists = await Artist.findAll({
      attributes: ['latitude', 'longitude', 'monthlyListeners', 'estimatedMonthlyRoyalty'],
      where: {
        latitude: { [sequelize.Op.not]: null },
        longitude: { [sequelize.Op.not]: null }
      }
    });

    // Create point features for clustering
    const points = artists.map(a => 
      turf.point([parseFloat(a.longitude), parseFloat(a.latitude)], {
        listeners: a.monthlyListeners,
        royalty: a.estimatedMonthlyRoyalty
      })
    );

    // Simple hotspot detection based on density
    const hotspots = [];
    
    // Group by proximity (simplified clustering)
    const clusters = {};
    const gridSize = 0.5; // degrees

    points.forEach(point => {
      const [lon, lat] = point.geometry.coordinates;
      const gridKey = `${Math.floor(lat/gridSize)}_${Math.floor(lon/gridSize)}`;
      
      if (!clusters[gridKey]) {
        clusters[gridKey] = {
          points: [],
          totalListeners: 0,
          totalRoyalty: 0,
          centerLat: lat,
          centerLon: lon
        };
      }

      clusters[gridKey].points.push(point);
      clusters[gridKey].totalListeners += point.properties.listeners || 0;
      clusters[gridKey].totalRoyalty += parseFloat(point.properties.royalty || 0);
    });

    // Convert clusters to hotspots
    Object.values(clusters).forEach(cluster => {
      if (cluster.points.length > 2) { // Minimum 3 artists
        hotspots.push({
          center: [cluster.centerLon, cluster.centerLat],
          artistCount: cluster.points.length,
          totalListeners: cluster.totalListeners,
          totalRoyalty: cluster.totalRoyalty,
          avgRoyalty: cluster.totalRoyalty / cluster.points.length
        });
      }
    });

    // Sort by total listeners
    hotspots.sort((a, b) => b.totalListeners - a.totalListeners);

    successResponse(res, 200, 'Hotspots analyzed', { hotspots: hotspots.slice(0, 20) });
  } catch (error) {
    console.error('Analyze hotspots error:', error);
    errorResponse(res, 500, 'Error analyzing hotspots');
  }
};

module.exports = {
  getMapData,
  getRegionalStats,
  analyzeHotspots
};