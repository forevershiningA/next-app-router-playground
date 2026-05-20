import { config } from 'dotenv';
config({ path: '.env.local' });
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const EMAIL = 'admin@forevershining.online';
const PASSWORD = 'TechPar123';

const passwordHash = bcrypt.hashSync(PASSWORD, 10);

const client = await pool.connect();
try {
  const res = await client.query(
    `INSERT INTO accounts (email, password_hash, role, status)
     VALUES ($1, $2, 'admin', 'active')
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           status = 'active'
     RETURNING id, email, role`,
    [EMAIL, passwordHash],
  );

  const account = res.rows[0];
  console.log('✅ Admin account:', account);

  await client.query(
    `INSERT INTO profiles (account_id, first_name, last_name)
     VALUES ($1, 'Admin', 'Forever Shining')
     ON CONFLICT (account_id) DO NOTHING`,
    [account.id],
  );

  console.log('✅ Profile created');
  console.log('\nAdmin credentials:');
  console.log('  URL:      /admin');
  console.log('  Email:   ', EMAIL);
  console.log('  Password:', PASSWORD);
} finally {
  client.release();
  await pool.end();
}
