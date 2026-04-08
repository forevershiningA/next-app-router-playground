# Database Sync to Neon (Production)

## Overview

Automated script to backup your local PostgreSQL database and sync it to Neon (Vercel's production database).

## ⚠️ Important Warning

**This script will:**
1. ✅ Create a backup of your local database
2. 🔴 **DROP ALL TABLES** in your Neon (production) database
3. ✅ Import the local backup to Neon
4. ✅ Verify the sync

**USE WITH CAUTION** - All production data will be replaced!

## Quick Start

### One Command Sync

```bash
npm run db:sync
```

This will:
- Backup local PostgreSQL → `database-exports/backup-YYYY-MM-DD_HH-MM-SS.sql`
- Drop all tables in Neon
- Import local data to Neon
- Verify the sync

### Safety Features

1. **Confirmation Required**: Script asks you to type "SYNC" before proceeding
2. **Automatic Backup**: Creates timestamped backup file before any changes
3. **Verification**: Shows table counts after sync to verify success
4. **Rollback Ready**: Backup file saved locally if you need to rollback

## Step-by-Step Process

### Manual Workflow

If you prefer manual control:

#### Step 1: Export Local Database

```bash
npm run db:export
```

Creates: `database-exports/headstonesdesigner-export-YYYY-MM-DD.sql`

#### Step 2: Import to Neon

```bash
npm run db:import
```

Imports the most recent export file to Neon (asks for confirmation).

## Configuration

The sync script uses these Neon credentials (from Vercel):

```javascript
NEON_CONFIG = {
  host: 'ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_4cngLG7qeuwQ',
}
```

These are **hardcoded** in `scripts/sync-to-neon.js` but can be overridden with environment variable:

```bash
POSTGRES_URL=your_neon_url npm run db:sync
```

## Local Database Connection

The script assumes your local PostgreSQL is:

```javascript
LOCAL_CONFIG = {
  host: 'localhost',
  port: '5432',
  user: 'postgres',
  password: 'postgres',
  database: 'headstonesdesigner'
}
```

## Requirements

### PostgreSQL Tools

The script requires `pg_dump` to be installed and in your PATH.

**Windows (via PostgreSQL installer):**
```bash
# pg_dump is installed with PostgreSQL
# Usually in: C:\Program Files\PostgreSQL\16\bin\
```

**Mac (via Homebrew):**
```bash
brew install postgresql
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt-get install postgresql-client
```

### Node.js Packages

The `pg` package is required (already in package.json):

```bash
npm install pg
```

## Troubleshooting

### Error: "pg_dump command not found"

**Solution**: Add PostgreSQL bin folder to PATH

```bash
# Windows - Add to System Environment Variables:
C:\Program Files\PostgreSQL\16\bin

# Mac/Linux - Add to ~/.bashrc or ~/.zshrc:
export PATH="/usr/local/pgsql/bin:$PATH"
```

### Error: "connection to server failed"

**Local Database:**
- Check PostgreSQL is running: `pg_ctl status`
- Verify connection: `psql -U postgres -d headstonesdesigner`

**Neon Database:**
- Check internet connection
- Verify credentials in script or environment variables
- Try manual connection: `psql "postgresql://neondb_owner:...@ep-aged-night..."`

### Error: "permission denied for schema public"

**Solution**: The script uses `--no-owner --no-acl` flags to avoid permission issues. If problems persist:

1. Check Neon user has CREATE privileges
2. Use the unpooled connection string for admin operations

### Sync Takes Too Long

Large databases may take several minutes. The script shows progress:
- ✓ Backup size in KB
- ✓ "Executing SQL dump..." during import
- ✓ Table counts after verification

## Backup Files

### Location

All backups are saved to: `database-exports/`

### Naming Convention

```
backup-YYYY-MM-DD_HH-MM-SS.sql
```

Example: `backup-2026-03-01_17-30-45.sql`

### Cleanup

Old backups are NOT automatically deleted. You can manually remove them:

```bash
# Keep only last 5 backups
cd database-exports
ls -t backup-*.sql | tail -n +6 | xargs rm
```

## Verification

After sync, the script shows:

```
📊 Tables synced:
   ✓ accounts
   ✓ materials
   ✓ shapes
   ✓ borders
   ✓ motifs
   ✓ additions
   ✓ projects
   ...

📦 Record counts:
   accounts        5
   materials       24
   shapes          18
   borders         12
   motifs          2458
   additions       82
   projects        15
```

Verify these counts match your local database.

## Rollback

If something goes wrong, you can restore from backup:

### Option 1: Rollback Neon to Previous Backup

```bash
# Find your backup file
ls -lt database-exports/

# Import specific backup to Neon
psql "postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" < database-exports/backup-YYYY-MM-DD_HH-MM-SS.sql
```

### Option 2: Restore to Local

```bash
# Drop and recreate local database
dropdb headstonesdesigner
createdb headstonesdesigner

# Restore from backup
psql -U postgres -d headstonesdesigner < database-exports/backup-YYYY-MM-DD_HH-MM-SS.sql
```

## Production Deployment

After syncing to Neon:

1. **Verify in Vercel Dashboard:**
   - Go to Storage → Your Database
   - Click "Data" tab
   - Check tables and row counts

2. **Deploy Application:**
   ```bash
   git push
   ```
   Vercel will automatically deploy with the new database data.

3. **Test Production:**
   - Visit your Vercel deployment URL
   - Verify data displays correctly
   - Test key functionality

## Script Files

- `scripts/sync-to-neon.js` - All-in-one sync script (this guide)
- `scripts/export-database.js` - Export local DB only
- `scripts/import-to-neon.js` - Import to Neon only
- `scripts/setup-database.js` - Initial database setup
- `scripts/verify-database.js` - Verify local database

## Environment Variables

The script can use these environment variables (optional):

```bash
# Override Neon connection
POSTGRES_URL=postgresql://...

# Override local connection
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=headstonesdesigner
```

## Security Notes

⚠️ **The Neon credentials are hardcoded in the script for convenience.**

For production use:

1. Move credentials to `.env.local` (not committed to git)
2. Use environment variables
3. Rotate password regularly
4. Consider IP whitelisting in Neon dashboard

Example `.env.local`:

```env
POSTGRES_URL=postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Then remove hardcoded credentials from script.

## Related Documentation

- `DATABASE_QUICKSTART.md` - Initial database setup
- `DATABASE_MIGRATION_GUIDE.md` - Schema migrations with Drizzle
- `DATABASE_EXPORT_IMPORT.md` - Detailed export/import procedures
- `VERCEL_DATABASE_SETUP.md` - Setting up Neon on Vercel

## Support

If you encounter issues:

1. Check PostgreSQL is running: `pg_isready`
2. Test local connection: `psql -U postgres -d headstonesdesigner`
3. Test Neon connection: `psql "postgresql://neondb_owner:..."`
4. Review script output for specific error messages
5. Check backup file was created: `ls -lh database-exports/`

## Changelog

### 2026-03-01
- Initial version with automated sync workflow
- Hardcoded Neon credentials
- Confirmation prompt before destructive operations
- Automatic backup creation
- Post-sync verification
