import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const passwordHash = bcrypt.hashSync('admin123', 10);

const client = await pool.connect();
try {
  const res = await client.query(`
    INSERT INTO accounts (email, password_hash, role, status)
    VALUES ($1, $2, 'admin', 'active')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, status = 'active'
    RETURNING id, email, role
  `, ['admin@forevershining.com', passwordHash]);

  const account = res.rows[0];
  console.log('✅ Account:', account);

  await client.query(`
    INSERT INTO profiles (account_id, first_name, last_name, phone)
    VALUES ($1, 'Admin', 'User', '+61 400 000 000')
    ON CONFLICT (account_id) DO NOTHING
  `, [account.id]);

  console.log('✅ Profile created');
  console.log('\nTest credentials:');
  console.log('  Email:    admin@forevershining.com');
  console.log('  Password: admin123');
} finally {
  client.release();
  await pool.end();
}
