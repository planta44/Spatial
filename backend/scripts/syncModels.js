require('dotenv').config();
const { sequelize } = require('../config/database');

// Import all models
const User = require('../models/User');
const University = require('../models/University');
const Course = require('../models/Course');
const Composition = require('../models/Composition');
const SpatialProject = require('../models/SpatialProject');
const Certification = require('../models/Certification');
const UserCertification = require('../models/UserCertification');
const Policy = require('../models/Policy');
const Resource = require('../models/Resource');
const PageContent = require('../models/PageContent');
const SpatialAudio = require('../models/SpatialAudio');
const Artist = require('../models/Artist');
const RegionAnalytics = require('../models/RegionAnalytics');

async function syncDatabase() {
  try {
    console.log('🔗 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    console.log('🏗️  Syncing models to database...');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Database tables synchronized successfully');

    // Create sample university if none exists
    const universityCount = await University.count();
    if (universityCount === 0) {
      console.log('📚 Creating sample universities...');
      
      await University.bulkCreate([
        {
          name: 'University of Nairobi',
          shortName: 'UoN',
          country: 'Kenya',
          county: 'Nairobi',
          city: 'Nairobi',
          email: 'info@uonbi.ac.ke',
          website: 'https://www.uonbi.ac.ke'
        },
        {
          name: 'Kenyatta University',
          shortName: 'KU',
          country: 'Kenya',
          county: 'Kiambu',
          city: 'Kahawa',
          email: 'info@ku.ac.ke',
          website: 'https://www.ku.ac.ke'
        },
        {
          name: 'Jomo Kenyatta University of Agriculture and Technology',
          shortName: 'JKUAT',
          country: 'Kenya',
          county: 'Kiambu',
          city: 'Juja',
          email: 'info@jkuat.ac.ke',
          website: 'https://www.jkuat.ac.ke'
        }
      ]);
      
      console.log('✅ Sample universities created');
    }

    // Create admin user if none exists
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      console.log('👤 Creating admin user...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        name: 'System Administrator',
        email: 'ruachkol@gmail.com',
        password: hashedPassword,
        role: 'admin',
        verificationStatus: 'verified',
        isActive: true
      });
      
      console.log('✅ Admin user created');
      console.log('📧 Admin email: ruachkol@gmail.com');
      console.log('🔑 Admin password: admin123 (change this in production!)');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 You can now start the server with: npm run dev');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  syncDatabase();
}

module.exports = { syncDatabase };
