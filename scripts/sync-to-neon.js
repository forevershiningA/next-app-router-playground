#!/usr/bin/env node

/**
 * Automated Database Backup & Sync to Neon
 * 
 * This script will:
 * 1. Backup local PostgreSQL database
 * 2. Drop all tables in Neon database (with confirmation)
 * 3. Import local backup to Neon
 * 4. Verify the sync
 */

const { Client } = require('pg');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Neon database connection (from Vercel)
const NEON_CONFIG = {
  connectionString: process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require',
  host: 'ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_4cngLG7qeuwQ',
};

// Local database connection
const LOCAL_CONFIG = {
  host: 'localhost',
  port: '5432',
  user: 'postgres',
  password: 'postgres',
  database: 'headstonesdesigner'
};

async function backupLocalDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 STEP 1: Backing up local database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').substring(0, 19);
  const exportDir = path.join(__dirname, '..', 'database-exports');
  const exportFile = path.join(exportDir, `backup-${timestamp}.sql`);

  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  console.log('🔍 Local database:');
  console.log(`   Host: ${LOCAL_CONFIG.host}:${LOCAL_CONFIG.port}`);
  console.log(`   Database: ${LOCAL_CONFIG.database}`);
  console.log(`   User: ${LOCAL_CONFIG.user}\n`);

  console.log('📤 Creating backup...');
  console.log(`   Output: ${exportFile}\n`);

  const env = { ...process.env, PGPASSWORD: LOCAL_CONFIG.password };
  const command = `pg_dump -h ${LOCAL_CONFIG.host} -p ${LOCAL_CONFIG.port} -U ${LOCAL_CONFIG.user} -d ${LOCAL_CONFIG.database} --clean --if-exists --no-owner --no-acl --column-inserts --rows-per-insert=100 -f "${exportFile}"`;

  return new Promise((resolve, reject) => {
    exec(command, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure PostgreSQL is running locally');
        console.error('2. Check that pg_dump is in your PATH');
        console.error('3. Verify local database exists\n');
        reject(error);
        return;
      }

      const stats = fs.statSync(exportFile);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      
      console.log('✅ Backup completed!');
      console.log(`📊 File size: ${fileSizeKB} KB\n`);
      
      resolve(exportFile);
    });
  });
}

async function dropNeonTables(client) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  STEP 2: Dropping existing tables in Neon');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Fetching existing tables...\n');

  const tablesResult = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  if (tablesResult.rows.length === 0) {
    console.log('ℹ️  No tables found in Neon database (fresh start)\n');
    return;
  }

  console.log('📋 Tables to be dropped:');
  tablesResult.rows.forEach(row => {
    console.log(`   • ${row.tablename}`);
  });
  console.log('');

  // Drop tables with CASCADE to handle dependencies
  console.log('🔨 Dropping tables...');
  for (const row of tablesResult.rows) {
    await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
    console.log(`   ✓ Dropped ${row.tablename}`);
  }

  // Also drop any sequences, views, etc.
  console.log('\n🔨 Cleaning up sequences and views...');
  await client.query(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
      END LOOP;
      FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
      END LOOP;
    END $$;
  `);

  console.log('✅ Neon database cleaned!\n');
}

async function importToNeon(exportFile) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 STEP 3: Importing to Neon database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Neon database:');
  console.log(`   Host: ${NEON_CONFIG.host}`);
  console.log(`   Database: ${NEON_CONFIG.database}`);
  console.log(`   User: ${NEON_CONFIG.user}\n`);

  console.log('📖 Reading backup file...');
  const sqlContent = fs.readFileSync(exportFile, 'utf8');
  console.log(`✅ Loaded ${(sqlContent.length / 1024).toFixed(2)} KB of SQL\n`);

  // Clean SQL content - remove problematic backslash commands
  console.log('🧹 Cleaning SQL content...');
  const cleanedSql = sqlContent
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      // Remove \restrict and other unknown backslash commands (PostgreSQL 17+ security feature)
      if (trimmed.startsWith('\\restrict') || trimmed.startsWith('\\unrestrict')) {
        console.log(`   Removed: ${trimmed.substring(0, 60)}...`);
        return false;
      }
      // Also remove empty backslash-only lines
      if (trimmed === '\\' || trimmed.match(/^\\\.+$/)) {
        console.log(`   Removed: ${trimmed}`);
        return false;
      }
      return true;
    })
    .join('\n');
  console.log('✅ SQL cleaned\n');

  const client = new Client({
    connectionString: NEON_CONFIG.connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to Neon...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Drop existing tables
    await dropNeonTables(client);

    // Import SQL dump
    console.log('🚀 Executing SQL dump...');
    console.log('   This may take a minute...\n');
    
    await client.query(cleanedSql);
    
    console.log('✅ Import completed!\n');

    return client;

  } catch (error) {
    await client.end();
    throw error;
  }
}

async function verifyImport(client) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 STEP 4: Verifying sync');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // List tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('📊 Tables synced:');
  tables.rows.forEach(row => {
    console.log(`   ✓ ${row.table_name}`);
  });

  // Count records in key tables
  console.log('\n📦 Record counts:');
  
  const tablesToCount = ['accounts', 'materials', 'shapes', 'borders', 'motifs', 'additions', 'projects'];
  
  for (const tableName of tablesToCount) {
    try {
      const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      console.log(`   ${tableName.padEnd(15)} ${result.rows[0].count}`);
    } catch (error) {
      // Table might not exist
      console.log(`   ${tableName.padEnd(15)} (not found)`);
    }
  }

  console.log('');
}

async function confirmAction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  WARNING: DATABASE SYNC OPERATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('This script will:');
  console.log('1. Backup your LOCAL database');
  console.log('2. DROP ALL TABLES in your NEON (production) database');
  console.log('3. Import the local backup to Neon');
  console.log('4. Verify the sync\n');
  console.log('🔴 ALL DATA IN NEON WILL BE REPLACED!\n');

  const answer = await new Promise(resolve => {
    rl.question('Type "SYNC" to continue or anything else to cancel: ', resolve);
  });
  rl.close();

  if (answer !== 'SYNC') {
    console.log('\n❌ Operation cancelled.\n');
    process.exit(0);
  }

  console.log('\n✅ Confirmed. Starting sync...\n');
}

async function main() {
  try {
    // Confirm before starting
    await confirmAction();

    // Step 1: Backup local database
    const exportFile = await backupLocalDatabase();

    // Steps 2-3: Drop Neon tables and import
    const client = await importToNeon(exportFile);

    // Step 4: Verify
    await verifyImport(client);
    await client.end();

    // Success!
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ DATABASE SYNC COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Your local database has been synced to Neon');
    console.log(`📁 Backup saved: ${exportFile}\n`);
    console.log('Next steps:');
    console.log('1. Deploy to Vercel (if needed): git push');
    console.log('2. Test your production app');
    console.log('3. Backup file is saved locally for rollback if needed\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ SYNC FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check that local PostgreSQL is running');
    console.error('2. Verify Neon connection credentials');
    console.error('3. Check network connectivity');
    console.error('4. Review error details above\n');
    process.exit(1);
  }
}

// Run the sync
main();
