# Vercel Database Setup Guide

This guide will help you set up a PostgreSQL database on Vercel and populate it with the initial schema and data.

## Option 1: Automatic Setup (Recommended)

We've created an automated setup script that will:
1. Connect to your Vercel Postgres database
2. Run the schema creation
3. Insert seed data
4. Verify the setup

### Steps:

1. **Create a Vercel Postgres Database:**
   - Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a database name (e.g., `headstone-designer-db`)
   - Select your region (choose closest to your users)
   - Click "Create"

2. **Get Database Credentials:**
   - After creating the database, click on it
   - Go to the ".env.local" tab
   - Copy all the environment variables (they will look like this):
     ```
     POSTGRES_URL="postgres://..."
     POSTGRES_PRISMA_URL="postgres://..."
     POSTGRES_URL_NO_SSL="postgres://..."
     POSTGRES_URL_NON_POOLING="postgres://..."
     POSTGRES_USER="..."
     POSTGRES_HOST="..."
     POSTGRES_PASSWORD="..."
     POSTGRES_DATABASE="..."
     ```

3. **Add to Local Environment:**
   - Create or update `.env.local` in your project root
   - Paste the copied environment variables

4. **Run the Setup Script:**
   ```bash
   npm run db:setup
   ```

   This will:
   - ✅ Create all database tables
   - ✅ Set up proper constraints and indexes
   - ✅ Insert initial seed data
   - ✅ Verify everything is working

5. **Verify Setup:**
   ```bash
   npm run db:verify
   ```

## Option 2: Manual Setup

If you prefer to set up manually or the automated script fails:

### 1. Install PostgreSQL Client

```bash
npm install -g pg
```

### 2. Connect to Database

Use the `POSTGRES_URL` from Vercel:

```bash
psql "postgres://your-connection-string"
```

### 3. Run Schema

Copy the contents of `sql/postgres-schema.sql` and paste it into the psql terminal, or:

```bash
psql "postgres://your-connection-string" < sql/postgres-schema.sql
```

### 4. Verify Tables

```sql
\dt
```

You should see:
- accounts
- profiles
- account_sessions
- password_resets
- materials
- shapes
- borders
- motifs
- projects
- project_assets
- project_events
- orders
- order_items
- payments
- audit_log

## Database Schema Overview

### Core Tables

**accounts** - User accounts (clients, designers, admins)
- Auto-creates a guest account for unauthenticated users
- Roles: client, designer, admin, superadmin
- Status: active, invited, suspended

**projects** - Saved headstone designs
- Links to accounts
- Stores design state as JSON (inscriptions, motifs, images, etc.)
- Includes pricing breakdown
- Status: draft, awaiting-approval, approved, in-production, archived

**materials** - Available materials (granite, bronze, etc.)
**shapes** - Available shapes (oval, heart, rectangle, etc.)
**borders** - Border designs
**motifs** - Decorative motifs/engravings

### Sample Data Included

The schema includes sample data:
- 3 materials (Polished Black Granite, Luka Grey Granite, Bronze)
- 3 shapes (Oval Landscape, Heart Classic, Rectangle Landscape)
- 2 borders
- 2 motifs (Rose, Cross)

## Environment Variables Required

Make sure these are set in both `.env.local` (local) and Vercel (production):

```env
# Vercel Postgres
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

## Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Environment Variables"
3. The database variables should already be set automatically when you created the database
4. Verify all `POSTGRES_*` variables are present

## Troubleshooting

### Error: "relation already exists"

This means tables are already created. You can either:
- Drop all tables and re-run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
- Or skip this error (tables already exist)

### Error: "could not connect to server"

Check:
- Your `POSTGRES_URL` is correct
- Your IP is whitelisted (Vercel Postgres allows all IPs by default)
- Database is running

### Error: "permission denied"

Check:
- You're using the correct user credentials
- The user has CREATE TABLE permissions

## Next Steps

After database setup:

1. **Test locally:**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000/my-account
   - Try saving a design

2. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add database setup"
   git push
   ```
   - Vercel will automatically deploy
   - Database environment variables are already set

3. **Verify production:**
   - Visit your-app.vercel.app/my-account
   - Test saving designs

## Database Migrations

For future schema changes, create migration files in `sql/migrations/`:

```sql
-- sql/migrations/001_add_customer_notes.sql
ALTER TABLE projects ADD COLUMN customer_notes text;
```

Then run:
```bash
npm run db:migrate
```

## Backup Recommendations

Vercel Postgres includes automatic backups, but you can also:

1. **Manual backup:**
   ```bash
   pg_dump "postgres://your-connection-string" > backup.sql
   ```

2. **Restore from backup:**
   ```bash
   psql "postgres://your-connection-string" < backup.sql
   ```

## Support

If you encounter issues:
- Check [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- Review logs: `vercel logs`
- Contact support: support@vercel.com
