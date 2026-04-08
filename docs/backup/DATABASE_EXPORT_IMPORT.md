# Database Export/Import - Quick Reference

## 🚀 One-Command Migration

```bash
# 1. Export local database
npm run db:export

# 2. Create Neon database in Vercel Dashboard

# 3. Import to Neon (add POSTGRES_URL to .env.local first)
npm run db:import
```

---

## 📋 Available Commands

```bash
npm run db:export      # Export local PostgreSQL → SQL file
npm run db:import      # Import SQL file → Neon
npm run db:verify      # Verify database status
npm run db:setup       # Initial database setup
npm run db:studio      # Open Drizzle Studio UI
```

---

## 📁 Files & Locations

**Export files:** `database-exports/headstonesdesigner-export-YYYY-MM-DD.sql`  
**Scripts:** `scripts/export-database.js`, `scripts/import-to-neon.js`  
**Guide:** `DATABASE_MIGRATION_GUIDE.md`  

---

## ⚙️ Environment Setup

### Local Development (.env.local):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner
```

### Production (Vercel Dashboard):
```env
POSTGRES_URL=postgres://...@...neon.tech/neondb?sslmode=require
```

---

## ✅ Quick Checklist

Export:
- [ ] PostgreSQL running locally
- [ ] Run `npm run db:export`
- [ ] Check `database-exports/` folder

Import:
- [ ] Created Neon database in Vercel
- [ ] Got Neon `POSTGRES_URL` from Vercel
- [ ] Added to `.env.local` temporarily
- [ ] Run `npm run db:import`
- [ ] Removed Neon URL from `.env.local`
- [ ] Added Neon URL to Vercel environment variables

Deploy:
- [ ] `git push` to deploy
- [ ] Test at `your-app.vercel.app`

---

## 🆘 Common Issues

**"pg_dump: command not found"**
→ Install PostgreSQL tools: `brew install postgresql` (Mac)

**"connection refused"**
→ Make sure local PostgreSQL is running

**"Missing POSTGRES_URL"**
→ Add Neon connection string to `.env.local`

---

## 📖 Full Documentation

See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.
