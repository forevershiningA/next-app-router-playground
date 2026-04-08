# Export & Import Database: Local PostgreSQL → Neon

This guide shows you how to export your local PostgreSQL database and import it into Neon for production.

---

## 🚀 Quick Migration (3 Steps)

### **Step 1: Export Local Database**

```bash
npm run db:export
```

This creates a SQL dump file in `database-exports/` folder.

**What it does:**
- ✅ Exports all tables
- ✅ Exports all data (accounts, projects, materials, etc.)
- ✅ Includes schema (CREATE TABLE statements)
- ✅ Includes constraints and indexes
- ✅ Creates timestamped backup file

### **Step 2: Create Neon Database**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → "Storage" tab
3. Click "Create Database" → Select **"Neon"** (Serverless Postgres)
4. Name it: `headstone-designer-prod`
5. Select region (closest to your users)
6. Click "Create"

### **Step 3: Import to Neon**

**Option A: Automatic (Recommended)**

```bash
# Temporarily add Neon URL to .env.local
POSTGRES_URL="postgres://...@...neon.tech/neondb?sslmode=require"

# Run import
npm run db:import
```

**Option B: Manual (Using psql)**

```bash
psql "YOUR_NEON_POSTGRES_URL" < database-exports/headstonesdesigner-export-2026-02-26.sql
```

**Done!** 🎉

---

## 📋 Detailed Step-by-Step Guide

### **1. Prepare Local Database**

Make sure your local PostgreSQL is running and has all your data:

```bash
# Check PostgreSQL is running
pg_isready

# Verify data exists
npm run db:verify
```

### **2. Export Local Data**

```bash
npm run db:export
```

**Output:**
```
📦 Exporting Local PostgreSQL Database...

✅ Created exports directory

🔍 Database configuration:
   Host: localhost
   Port: 5432
   Database: headstonesdesigner
   User: postgres

📤 Exporting database...
   Output: C:\...\database-exports\headstonesdesigner-export-2026-02-26.sql

✅ Export completed successfully!

📊 Export file size: 45.23 KB

📍 Export location:
   C:\Users\...\database-exports\headstonesdesigner-export-2026-02-26.sql
```

### **3. Create Neon Database**

#### In Vercel Dashboard:

1. **Navigate:**
   - Vercel Dashboard → Your Project
   - Click "Storage" tab
   - Click "Create Database"

2. **Select Neon:**
   - Choose "Neon" (Serverless Postgres)
   - Not Supabase, AWS, or others

3. **Configure:**
   - **Name:** `headstone-designer-prod`
   - **Region:** Select closest to your users (e.g., US East, EU West)
   - **Plan:** Free tier is fine to start

4. **Create:**
   - Click "Create"
   - Wait ~30 seconds

5. **Get Credentials:**
   - After creation, click the database
   - Go to ".env.local" tab
   - You'll see variables like:
     ```env
     POSTGRES_URL="postgres://username:password@ep-cool-name.region.aws.neon.tech/neondb?sslmode=require"
     POSTGRES_PRISMA_URL="postgres://..."
     # ... more variables
     ```

### **4. Import to Neon**

#### **Method A: Using npm script (Easiest)**

1. **Temporarily update `.env.local`:**
   ```env
   # Comment out local database
   # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
   
   # Add Neon database (from Vercel)
   POSTGRES_URL="postgres://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
   ```

2. **Run import:**
   ```bash
   npm run db:import
   ```

3. **Confirm when prompted:**
   ```
   ⚠️  WARNING: This will replace all data in your Neon database!
   Are you sure you want to continue? (yes/no): yes
   ```

4. **Wait for completion:**
   ```
   📡 Connecting to Neon database...
   ✅ Connected!
   
   🔨 Executing SQL dump...
      This may take a minute...
   
   ✅ Import completed successfully!
   
   🔍 Verifying import...
   
   📊 Tables imported:
      ✓ accounts
      ✓ materials
      ✓ projects
      ... (15 tables total)
   
   📦 Record counts:
      Accounts: 1
      Materials: 3
      Shapes: 3
      Borders: 2
      Motifs: 2
      Projects: 5
   
   ✨ Database import complete!
   ```

5. **Restore `.env.local`:**
   ```env
   # Put back local database for development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
   
   # Remove or comment out Neon URL
   # POSTGRES_URL="postgres://..."
   ```

#### **Method B: Using psql directly**

```bash
# Get your Neon URL from Vercel Dashboard
# Then run:
psql "postgres://username:password@ep-xxx.neon.tech/neondb?sslmode=require" < database-exports/headstonesdesigner-export-2026-02-26.sql
```

#### **Method C: Using Vercel Dashboard (Manual)**

1. Go to Vercel Dashboard → Storage → Your Neon Database
2. Click "Query" tab
3. Open your export file in a text editor
4. Copy the SQL content
5. Paste into the query editor
6. Click "Run Query"

---

## 🔄 Complete Workflow Example

### **Scenario: Moving from Local Dev to Production**

```bash
# 1. Export your local database
npm run db:export

# 2. Create Neon database in Vercel (web UI)

# 3. Import to Neon
npm run db:import

# 4. Configure Vercel environment variables
# (Already done when you created the database)

# 5. Deploy to Vercel
git add .
git commit -m "Ready for production"
git push

# 6. Test production
# Visit your-app.vercel.app
```

---

## 📊 What Gets Exported?

### **Schema (Structure):**
- ✅ All table definitions
- ✅ Primary keys
- ✅ Foreign keys
- ✅ Indexes
- ✅ Constraints
- ✅ Extensions (pgcrypto, citext)

### **Data (Content):**
- ✅ User accounts
- ✅ Saved designs/projects
- ✅ Materials catalog
- ✅ Shapes catalog
- ✅ Borders catalog
- ✅ Motifs catalog
- ✅ Orders (if any)
- ✅ All other records

### **What's Excluded:**
- ❌ PostgreSQL roles/users
- ❌ Database-specific settings
- ❌ Ownership information
- ❌ Permissions/ACLs

---

## 🔐 Vercel Environment Variables

After importing, set these in Vercel Dashboard:

**Settings → Environment Variables:**

```env
POSTGRES_URL="postgres://...@...neon.tech/neondb?sslmode=require"
POSTGRES_PRISMA_URL="postgres://...@...neon.tech/neondb?sslmode=require&pgbouncer=true"
POSTGRES_URL_NO_SSL="postgres://...@...neon.tech/neondb"
POSTGRES_URL_NON_POOLING="postgres://...@...neon.tech/neondb?sslmode=require"
POSTGRES_USER="username"
POSTGRES_HOST="ep-xxx.neon.tech"
POSTGRES_PASSWORD="xxx"
POSTGRES_DATABASE="neondb"
```

**Set for:** Production (not Preview or Development)

---

## ✅ Verification Checklist

After import, verify everything worked:

- [ ] All tables exist (15 tables)
- [ ] Data counts match
- [ ] Can query tables
- [ ] Foreign keys work
- [ ] Indexes exist
- [ ] App connects successfully
- [ ] Can save new designs
- [ ] Can load existing designs

**Test in production:**
```bash
# Deploy to Vercel
git push

# Visit your app
https://your-app.vercel.app/my-account

# Try:
# - View saved designs (should show your local data)
# - Save a new design
# - Edit an existing design
# - Delete a design
```

---

## 🎯 Maintaining Two Databases

After import, you'll have:

### **Local (Development):**
```env
# .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
```
- Your test data
- Safe to experiment
- Fast and offline

### **Neon (Production):**
```env
# Vercel environment variables
POSTGRES_URL=postgres://...neon.tech/neondb
```
- Real customer data
- Managed and backed up
- Scalable and secure

---

## 🔄 Syncing Updates

If you make changes locally and want to push to production:

**Option 1: Export & Import Again**
```bash
npm run db:export
npm run db:import
```

**Option 2: Run Specific SQL**
```sql
-- Create migration file
-- sql/migrations/001_add_feature.sql

ALTER TABLE projects ADD COLUMN notes text;
```

Then run on Neon:
```bash
psql "YOUR_NEON_URL" < sql/migrations/001_add_feature.sql
```

---

## 📦 Backup Recommendations

### **Before Import:**
Always export first, so you have a backup:
```bash
npm run db:export
```

### **Regular Backups:**
```bash
# Weekly backups
npm run db:export
```

Neon also provides automatic backups:
- Point-in-time recovery
- Daily snapshots
- 7-day retention (free tier)

---

## ⚠️ Important Notes

1. **The import REPLACES all data in Neon**
   - Any existing data will be overwritten
   - Make sure this is what you want

2. **Password Security**
   - Never commit `.env.local` (already in `.gitignore`)
   - Use different passwords for local vs production

3. **Data Privacy**
   - Export files contain all your data
   - Add `database-exports/` to `.gitignore`
   - Don't share export files publicly

4. **First Deploy**
   - If this is your first time, Neon database will be empty
   - Safe to import without worry

---

## 🆘 Troubleshooting

### **"pg_dump: command not found"**
Install PostgreSQL tools:
- **Windows:** Included with PostgreSQL installer
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt install postgresql-client`

### **"connection refused"**
- Make sure PostgreSQL is running locally
- Check connection details in export script

### **"authentication failed"**
- Check your PostgreSQL password
- Update script if using different credentials

### **"permission denied"**
- Check file permissions in database-exports folder
- Try running as administrator

### **Import hangs or times out**
- Large databases may take several minutes
- Check Neon connection is stable
- Try splitting into smaller batches

---

## 📞 Support

- **Local DB Issues:** Check PostgreSQL logs
- **Export Issues:** Run `npm run db:verify` first
- **Neon Issues:** Vercel Support or Neon Dashboard
- **Import Issues:** Check SQL syntax in export file

---

## ✨ You're All Set!

Your database migration tools are ready to use:

```bash
npm run db:export   # Export local → SQL file
npm run db:import   # Import SQL file → Neon
npm run db:verify   # Check database status
```

**Next:** Run `npm run db:export` to create your first backup! 🚀
