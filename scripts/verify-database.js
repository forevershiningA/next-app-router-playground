#!/usr/bin/env node

/**
 * Database Verification Script
 * 
 * Checks that all tables and seed data are properly set up
 */

const { Client } = require('pg');

async function verifyDatabase() {
  console.log('🔍 Verifying Vercel Postgres Database...\n');

  if (!process.env.POSTGRES_URL) {
    console.error('❌ Error: POSTGRES_URL not found in environment variables');
    console.error('Please create a .env.local file with your database credentials.\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful\n');

    // Check all expected tables
    const expectedTables = [
      'accounts',
      'profiles',
      'account_sessions',
      'password_resets',
      'materials',
      'shapes',
      'borders',
      'motifs',
      'projects',
      'project_assets',
      'project_events',
      'orders',
      'order_items',
      'payments',
      'audit_log'
    ];

    console.log('📊 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log('❌ Missing tables:');
      missingTables.forEach(t => console.log(`   - ${t}`));
      console.log('\nRun "npm run db:setup" to create missing tables.\n');
      process.exit(1);
    }

    console.log('✅ All expected tables exist\n');

    // Check seed data
    console.log('📦 Checking seed data...');
    
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM materials'),
      client.query('SELECT COUNT(*) FROM shapes'),
      client.query('SELECT COUNT(*) FROM borders'),
      client.query('SELECT COUNT(*) FROM motifs'),
      client.query('SELECT COUNT(*) FROM projects'),
    ]);

    const [materials, shapes, borders, motifs, projects] = counts.map(r => parseInt(r.rows[0].count));

    console.log(`   Materials: ${materials}`);
    console.log(`   Shapes: ${shapes}`);
    console.log(`   Borders: ${borders}`);
    console.log(`   Motifs: ${motifs}`);
    console.log(`   Projects: ${projects}\n`);

    if (materials === 0 || shapes === 0) {
      console.log('⚠️  Warning: Missing seed data for materials or shapes');
      console.log('Run "npm run db:setup" to insert seed data.\n');
    } else {
      console.log('✅ Seed data present\n');
    }

    // Test a simple query
    console.log('🧪 Testing queries...');
    const testQuery = await client.query(`
      SELECT m.name as material, s.name as shape
      FROM materials m
      CROSS JOIN shapes s
      LIMIT 1
    `);

    if (testQuery.rows.length > 0) {
      console.log('✅ Queries working correctly\n');
    }

    // Check guest account
    const guestAccount = await client.query(`
      SELECT id, email, role FROM accounts WHERE email = 'guest@local.project'
    `);

    if (guestAccount.rows.length > 0) {
      console.log('✅ Guest account exists');
      console.log(`   Email: ${guestAccount.rows[0].email}`);
      console.log(`   Role: ${guestAccount.rows[0].role}\n`);
    } else {
      console.log('ℹ️  Guest account will be created on first save\n');
    }

    console.log('✨ Database verification complete!\n');
    console.log('Your database is ready to use. 🎉\n');

  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error.message);
    console.error('\nSee VERCEL_DATABASE_SETUP.md for troubleshooting help.\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
