#!/usr/bin/env node

/**
 * Automated Database Backup & Sync to a remote PostgreSQL database
 *
 * This script will:
 * 1. Backup the local PostgreSQL database
 * 2. Drop all tables in the remote database (with confirmation)
 * 3. Import the local backup to the remote database
 * 4. Verify the sync
 */

const { Client } = require('pg');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const parseBoolean = (value, fallback) => {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const TARGET_CONFIG = {
  label: process.env.DB_SYNC_TARGET_LABEL || 'home.pl',
  connectionString: process.env.DB_SYNC_TARGET_URL || process.env.HOMEPL_DATABASE_URL || '',
  host: process.env.DB_SYNC_TARGET_HOST || 'wiecznapamiec.home.pl',
  port: process.env.DB_SYNC_TARGET_PORT || '5432',
  database: process.env.DB_SYNC_TARGET_DATABASE || '11276881_forevershining',
  user: process.env.DB_SYNC_TARGET_USER || '11276881_forevershining',
  password: process.env.DB_SYNC_TARGET_PASSWORD || process.env.HOMEPL_DATABASE_PASSWORD || '',
  ssl: parseBoolean(process.env.DB_SYNC_TARGET_SSL, false),
};

// Local database connection
const LOCAL_CONFIG = {
  host: process.env.LOCAL_DATABASE_HOST || 'localhost',
  port: process.env.LOCAL_DATABASE_PORT || '5432',
  user: process.env.LOCAL_DATABASE_USER || 'postgres',
  password: process.env.LOCAL_DATABASE_PASSWORD || 'postgres',
  database: process.env.LOCAL_DATABASE_NAME || 'headstonesdesigner',
};

function cleanSqlDump(sqlContent) {
  console.log('🧹 Cleaning SQL content...');
  const cleanedSql = sqlContent
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('\\restrict') || trimmed.startsWith('\\unrestrict')) {
        console.log(`   Removed: ${trimmed.substring(0, 60)}...`);
        return false;
      }
      if (trimmed === '\\' || trimmed.match(/^\\\.+$/)) {
        console.log(`   Removed: ${trimmed}`);
        return false;
      }
      if (/^SET\s+transaction_timeout\s*=.*;$/i.test(trimmed)) {
        console.log(`   Removed: ${trimmed}`);
        return false;
      }
      return true;
    })
    .join('\n');
  console.log('✅ SQL cleaned\n');
  return cleanedSql;
}

function ensureTargetConfig() {
  if (TARGET_CONFIG.connectionString) {
    return;
  }

  if (!TARGET_CONFIG.password) {
    console.error(`❌ Error: Missing remote database password for ${TARGET_CONFIG.label}.\n`);
    console.error('Set one of these environment variables in `.env.local` or your shell:');
    console.error('  - DB_SYNC_TARGET_PASSWORD');
    console.error('  - HOMEPL_DATABASE_PASSWORD\n');
    console.error('Optional variables:');
    console.error('  - DB_SYNC_TARGET_HOST');
    console.error('  - DB_SYNC_TARGET_PORT');
    console.error('  - DB_SYNC_TARGET_DATABASE');
    console.error('  - DB_SYNC_TARGET_USER');
    console.error('  - DB_SYNC_TARGET_SSL (default: false)\n');
    process.exit(1);
  }
}

function createTargetClient() {
  if (TARGET_CONFIG.connectionString) {
    return new Client({
      connectionString: TARGET_CONFIG.connectionString,
      ssl: TARGET_CONFIG.ssl ? { rejectUnauthorized: false } : false,
    });
  }

  return new Client({
    host: TARGET_CONFIG.host,
    port: Number(TARGET_CONFIG.port),
    database: TARGET_CONFIG.database,
    user: TARGET_CONFIG.user,
    password: TARGET_CONFIG.password,
    ssl: TARGET_CONFIG.ssl ? { rejectUnauthorized: false } : false,
  });
}

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

async function dropRemoteTables(client) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🗑️  STEP 2: Dropping existing tables in ${TARGET_CONFIG.label}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Fetching existing tables...\n');

  const tablesResult = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);

  if (tablesResult.rows.length === 0) {
    console.log(`ℹ️  No tables found in ${TARGET_CONFIG.label} database (fresh start)\n`);
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

  console.log(`✅ ${TARGET_CONFIG.label} database cleaned!\n`);
}

async function importToRemote(exportFile) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📥 STEP 3: Importing to ${TARGET_CONFIG.label} database`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🔍 ${TARGET_CONFIG.label} database:`);
  console.log(`   Host: ${TARGET_CONFIG.host}:${TARGET_CONFIG.port}`);
  console.log(`   Database: ${TARGET_CONFIG.database}`);
  console.log(`   User: ${TARGET_CONFIG.user}`);
  console.log(`   SSL: ${TARGET_CONFIG.ssl ? 'enabled' : 'disabled'}\n`);

  console.log('📖 Reading backup file...');
  const sqlContent = fs.readFileSync(exportFile, 'utf8');
  console.log(`✅ Loaded ${(sqlContent.length / 1024).toFixed(2)} KB of SQL\n`);

  const cleanedSql = cleanSqlDump(sqlContent);

  const client = createTargetClient();

  try {
    console.log(`📡 Connecting to ${TARGET_CONFIG.label}...`);
    await client.connect();
    console.log('✅ Connected!\n');

    // Drop existing tables
    await dropRemoteTables(client);

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
  console.log(`2. DROP ALL TABLES in your ${TARGET_CONFIG.label} database`);
  console.log(`3. Import the local backup to ${TARGET_CONFIG.label}`);
  console.log('4. Verify the sync\n');
  console.log(`🔴 ALL DATA IN ${TARGET_CONFIG.label.toUpperCase()} WILL BE REPLACED!\n`);

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
    ensureTargetConfig();

    // Confirm before starting
    await confirmAction();

    // Step 1: Backup local database
    const exportFile = await backupLocalDatabase();

    // Steps 2-3: Drop remote tables and import
    const client = await importToRemote(exportFile);

    // Step 4: Verify
    await verifyImport(client);
    await client.end();

    // Success!
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ DATABASE SYNC COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Your local database has been synced to ${TARGET_CONFIG.label}`);
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
    console.error(`2. Verify ${TARGET_CONFIG.label} connection credentials`);
    console.error('3. Check network connectivity');
    console.error('4. Review error details above\n');
    process.exit(1);
  }
}

// Run the sync
main();
