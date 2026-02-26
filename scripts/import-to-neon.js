#!/usr/bin/env node

/**
 * Import Database to Neon
 * 
 * This script will:
 * 1. Connect to your Neon PostgreSQL database
 * 2. Import the exported SQL dump
 * 3. Verify the import
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function importToNeon() {
  console.log('📥 Importing Database to Neon...\n');

  // Check for Neon connection string
  const neonUrl = process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  
  if (!neonUrl) {
    console.error('❌ Error: No Neon database connection string found!\n');
    console.error('Please set one of these environment variables:');
    console.error('  - POSTGRES_URL (in .env.local)');
    console.error('  - NEON_DATABASE_URL\n');
    console.error('Get your connection string from:');
    console.error('  Vercel Dashboard → Storage → Your Database → .env.local tab\n');
    process.exit(1);
  }

  // Check if this is a local database (safety check)
  if (neonUrl.includes('localhost') || neonUrl.includes('127.0.0.1')) {
    console.error('❌ Error: This appears to be a local database URL!');
    console.error('Please use your Neon (cloud) database URL instead.\n');
    process.exit(1);
  }

  // Find the most recent export file
  const exportDir = path.join(__dirname, '..', 'database-exports');
  
  if (!fs.existsSync(exportDir)) {
    console.error('❌ Error: No exports directory found!');
    console.error('Please run: npm run db:export first\n');
    process.exit(1);
  }

  const files = fs.readdirSync(exportDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ Error: No export files found!');
    console.error('Please run: npm run db:export first\n');
    process.exit(1);
  }

  const exportFile = path.join(exportDir, files[0]);
  console.log('📁 Using export file:');
  console.log(`   ${exportFile}\n`);

  // Read SQL file
  console.log('📖 Reading SQL dump...');
  const sqlContent = fs.readFileSync(exportFile, 'utf8');
  console.log(`✅ Loaded ${(sqlContent.length / 1024).toFixed(2)} KB of SQL\n`);

  // Confirm before proceeding
  console.log('⚠️  WARNING: This will replace all data in your Neon database!\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    rl.question('Are you sure you want to continue? (yes/no): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Import cancelled.\n');
    process.exit(0);
  }

  console.log('\n🚀 Starting import...\n');

  const client = new Client({
    connectionString: neonUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('🔨 Executing SQL dump...');
    console.log('   This may take a minute...\n');
    
    await client.query(sqlContent);
    
    console.log('✅ Import completed successfully!\n');

    // Verify import
    console.log('🔍 Verifying import...\n');

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Tables imported:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Count records
    console.log('\n📦 Record counts:');
    
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM accounts'),
      client.query('SELECT COUNT(*) FROM materials'),
      client.query('SELECT COUNT(*) FROM shapes'),
      client.query('SELECT COUNT(*) FROM borders'),
      client.query('SELECT COUNT(*) FROM motifs'),
      client.query('SELECT COUNT(*) FROM projects'),
    ]);

    console.log(`   Accounts: ${counts[0].rows[0].count}`);
    console.log(`   Materials: ${counts[1].rows[0].count}`);
    console.log(`   Shapes: ${counts[2].rows[0].count}`);
    console.log(`   Borders: ${counts[3].rows[0].count}`);
    console.log(`   Motifs: ${counts[4].rows[0].count}`);
    console.log(`   Projects: ${counts[5].rows[0].count}`);

    console.log('\n✨ Database import complete!\n');
    console.log('Next steps:');
    console.log('1. Remove the Neon POSTGRES_URL from .env.local');
    console.log('2. Add back your local DATABASE_URL');
    console.log('3. Deploy to Vercel: git push');
    console.log('4. Test your production app!\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your Neon connection string is correct');
    console.error('2. Make sure the Neon database is accessible');
    console.error('3. Check for SQL syntax errors in the dump file\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run import
importToNeon().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
