# Database Sync - Quick Reference

## 🚀 Quick Commands

### Sync Local → Neon (Production)
```bash
npm run db:sync
```
⚠️ **Warning**: Replaces ALL data in Neon with local database

### Manual Steps

**1. Export Local Database**
```bash
npm run db:export
```
Output: `database-exports/headstonesdesigner-export-YYYY-MM-DD.sql`

**2. Import to Neon**
```bash
npm run db:import
```
Imports most recent export file

## 🔍 Verification

**Check Local Database**
```bash
npm run db:verify
```

**Check Neon via Vercel**
- Go to: https://vercel.com/dashboard
- Storage → Your Database → Data tab

**Check Neon via CLI**
```bash
psql "postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

Then run:
```sql
\dt                           -- List tables
SELECT COUNT(*) FROM motifs;  -- Count records
SELECT COUNT(*) FROM additions;
```

## 🔐 Neon Credentials

**Connection String (Pooled):**
```
postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Connection String (Direct):**
```
postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Individual Parameters:**
```
PGHOST=ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_4cngLG7qeuwQ
```

## 📦 Backup Locations

**Local Backups:** `database-exports/`

**Naming:** `backup-YYYY-MM-DD_HH-MM-SS.sql`

## 🔄 Rollback

**Restore Neon from Backup:**
```bash
psql "postgresql://neondb_owner:npg_4cngLG7qeuwQ@ep-aged-night-aibddvtz-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" < database-exports/backup-2026-03-01_17-30-45.sql
```

**Restore Local from Backup:**
```bash
dropdb headstonesdesigner
createdb headstonesdesigner
psql -U postgres -d headstonesdesigner < database-exports/backup-2026-03-01_17-30-45.sql
```

## ⚡ Common Issues

### `pg_dump: command not found`
Add PostgreSQL bin to PATH:
```bash
# Windows (PowerShell Admin)
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Mac/Linux
export PATH="/usr/local/pgsql/bin:$PATH"
```

### `Connection refused` (Local)
Start PostgreSQL:
```bash
# Windows
pg_ctl start

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### `Connection timeout` (Neon)
- Check internet connection
- Verify credentials are correct
- Try direct (non-pooled) connection

## 📝 Typical Workflow

### Development → Production

1. **Develop locally** with local PostgreSQL
2. **Test changes** with local database
3. **Create backup**: `npm run db:export`
4. **Sync to Neon**: `npm run db:sync`
5. **Deploy to Vercel**: `git push`
6. **Verify production** works correctly

### Production → Local (Reverse Sync)

Currently not automated. Manual process:

1. Export from Neon using Vercel Dashboard
2. Download SQL dump
3. Import to local:
   ```bash
   psql -U postgres -d headstonesdesigner < neon-export.sql
   ```

## 🔑 Key Tables

- `accounts` - User accounts
- `profiles` - User profile data
- `materials` - Headstone materials (24 items)
- `shapes` - Headstone shapes (18 items)
- `borders` - Border designs (12 items)
- `motifs` - Laser-etched motifs (2458 items)
- `additions` - Bronze additions (82 items)
- `projects` - Saved designs

## 🎯 Safety Checklist

Before running `npm run db:sync`:

- [ ] Have you tested locally?
- [ ] Is production data backed up?
- [ ] Do you have recent export files?
- [ ] Are you ready to replace ALL production data?
- [ ] Type "SYNC" when prompted (script won't run without it)

## 📚 Full Documentation

See `DATABASE_SYNC_NEON.md` for complete guide including:
- Detailed troubleshooting
- Security considerations
- Advanced configuration
- Rollback procedures
- Environment variables
