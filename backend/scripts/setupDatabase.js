const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DB_RESET !== 'true') {
    console.error('❌ Refusing to reset database in production without ALLOW_DB_RESET=true');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'spatial_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  });

  try {
    console.log('🔗 Connecting to PostgreSQL database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read and execute the SQL file
    console.log('📝 Reading database setup SQL file...');
    const sqlFilePath = path.join(__dirname, '../migrations/init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('🏗️  Setting up database tables...');
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'PRINT \'Database setup completed successfully!\'');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Skip certain expected errors
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('PRINT')) {
            console.log(`⚠️  Skipping: ${error.message.split('\n')[0]}`);
            continue;
          }
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
        }
      }
    }

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
