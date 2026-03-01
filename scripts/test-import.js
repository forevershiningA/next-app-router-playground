#!/usr/bin/env node

/**
 * Simple test - Import latest backup to Neon directly
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const NEON_URL = 'postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function test() {
  // Find latest backup
  const exportDir = path.join(__dirname, '..', 'database-exports');
  const files = fs.readdirSync(exportDir)
    .filter(f => f.endsWith('.sql') && !f.includes('cleaned'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.error('No backup files found!');
    process.exit(1);
  }

  const exportFile = path.join(exportDir, files[0]);
  console.log(`Using: ${files[0]}\n`);

  // Read SQL
  const sqlContent = fs.readFileSync(exportFile, 'utf8');
  console.log(`File size: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

  // Connect
  const client = new Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!\n');

    console.log('Executing SQL...');
    await client.query(sqlContent);
    console.log('✅ Success!\n');

    // Verify
    const result = await client.query('SELECT COUNT(*) FROM motifs');
    console.log(`Motifs count: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFirst 200 chars of error:');
    console.error(error.message.substring(0, 200));
  } finally {
    await client.end();
  }
}

test();
