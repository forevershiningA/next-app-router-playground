#!/usr/bin/env node

/**
 * Export Local PostgreSQL Database
 * 
 * This script will:
 * 1. Connect to your local PostgreSQL database
 * 2. Export all data (schema + data)
 * 3. Create a SQL dump file
 * 4. Show instructions for importing to Neon
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function exportDatabase() {
  console.log('📦 Exporting Local PostgreSQL Database...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const exportDir = path.join(__dirname, '..', 'database-exports');
  const exportFile = path.join(exportDir, `headstonesdesigner-export-${timestamp}.sql`);

  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log('✅ Created exports directory\n');
  }

  // Database connection info
  const dbConfig = {
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'postgres',
    database: 'headstonesdesigner'
  };

  console.log('🔍 Database configuration:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}\n`);

  console.log('📤 Exporting database...');
  console.log(`   Output: ${exportFile}\n`);

  // Set password environment variable
  const env = { ...process.env, PGPASSWORD: dbConfig.password };

  // Build pg_dump command
  const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} --clean --if-exists --no-owner --no-acl --column-inserts --rows-per-insert=100 -f "${exportFile}"`;

  return new Promise((resolve, reject) => {
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Export failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure PostgreSQL is running');
        console.error('2. Check that pg_dump is in your PATH');
        console.error('3. Verify database connection details');
        console.error('4. Try running manually:');
        console.error(`   ${command}\n`);
        reject(error);
        return;
      }

      if (stderr) {
        console.log('⚠️  Warnings:', stderr);
      }

      console.log('✅ Export completed successfully!\n');
      
      // Check file size
      const stats = fs.statSync(exportFile);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`📊 Export file size: ${fileSizeKB} KB\n`);

      console.log('📍 Export location:');
      console.log(`   ${exportFile}\n`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✨ NEXT STEPS: Import to Neon\n');
      console.log('Option 1: Using psql (Recommended)\n');
      console.log('1. Get your Neon connection string:');
      console.log('   - Go to Vercel Dashboard → Storage → Your Database');
      console.log('   - Copy POSTGRES_URL\n');
      console.log('2. Run this command:\n');
      console.log('   psql "YOUR_NEON_POSTGRES_URL" < ' + exportFile + '\n');
      console.log('   Example:');
      console.log('   psql "postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" < ' + exportFile + '\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Option 2: Using npm script\n');
      console.log('1. Add your Neon POSTGRES_URL to .env.local temporarily');
      console.log('2. Run: npm run db:import\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Option 3: Using the import script\n');
      console.log('   node scripts/import-to-neon.js\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      resolve();
    });
  });
}

// Run export
exportDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
