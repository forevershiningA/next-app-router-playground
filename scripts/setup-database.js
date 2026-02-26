#!/usr/bin/env node

/**
 * Automated Database Setup Script for Vercel Postgres
 * 
 * This script will:
 * 1. Connect to your Vercel Postgres database
 * 2. Run schema creation
 * 3. Insert seed data
 * 4. Verify the setup
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Starting Vercel Postgres Database Setup...\n');

  // Check for required environment variables
  const requiredEnvVars = ['POSTGRES_URL'];
  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Error: Missing required environment variables:');
    missingEnvVars.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease create a .env.local file with your Vercel Postgres credentials.');
    console.error('See VERCEL_DATABASE_SETUP.md for instructions.\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'sql', 'postgres-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded\n');

    // Execute schema
    console.log('🔨 Creating database schema...');
    console.log('   - Creating extensions (pgcrypto, citext)');
    console.log('   - Creating tables (accounts, projects, materials, etc.)');
    console.log('   - Setting up constraints and indexes');
    console.log('   - Inserting seed data');
    
    await client.query(schema);
    console.log('✅ Schema created successfully!\n');

    // Verify setup
    console.log('🔍 Verifying database setup...\n');

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Tables created:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Check seed data
    const materialsCount = await client.query('SELECT COUNT(*) FROM materials');
    const shapesCount = await client.query('SELECT COUNT(*) FROM shapes');
    const bordersCount = await client.query('SELECT COUNT(*) FROM borders');
    const motifsCount = await client.query('SELECT COUNT(*) FROM motifs');

    console.log('\n📦 Seed data:');
    console.log(`   ✓ Materials: ${materialsCount.rows[0].count}`);
    console.log(`   ✓ Shapes: ${shapesCount.rows[0].count}`);
    console.log(`   ✓ Borders: ${bordersCount.rows[0].count}`);
    console.log(`   ✓ Motifs: ${motifsCount.rows[0].count}`);

    console.log('\n✨ Database setup complete!\n');
    console.log('Next steps:');
    console.log('1. Run "npm run dev" to start the development server');
    console.log('2. Visit http://localhost:3000/my-account');
    console.log('3. Try saving a design to test the database\n');

  } catch (error) {
    console.error('\n❌ Error during setup:');
    console.error(error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 Note: Some objects already exist in the database.');
      console.log('This is usually fine - the database may have been set up previously.');
      console.log('Run "npm run db:verify" to check the current state.\n');
    } else {
      console.error('\nSee VERCEL_DATABASE_SETUP.md for troubleshooting help.\n');
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
