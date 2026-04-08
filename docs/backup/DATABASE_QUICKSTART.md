# Quick Start: Vercel Database Setup

## TL;DR - 3 Steps to Production Database

### Step 1: Create Database on Vercel (2 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Storage" tab
4. Click "Create Database" → Select "Postgres"
5. Name it: `headstone-designer-db`
6. Select your region
7. Click "Create"

### Step 2: Copy Environment Variables (30 seconds)

1. After database is created, click on it
2. Go to ".env.local" tab
3. Click "Copy Snippet"
4. Paste into your local `.env.local` file in project root

### Step 3: Run Setup Script (1 minute)

```bash
npm run db:setup
```

**That's it!** ✨ Your database is ready.

## Verify It Works

```bash
npm run db:verify
```

## Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/my-account

Try saving a design - it should save to your Vercel database!

## Deploy to Production

```bash
git add .
git commit -m "Setup database"
git push
```

Vercel will automatically:
- Deploy your app
- Connect to the database (env vars already set)
- Everything works! 🎉

## What the Setup Script Does

✅ Creates 15 database tables  
✅ Sets up proper relationships  
✅ Adds constraints and indexes  
✅ Inserts seed data (3 materials, 3 shapes, 2 borders, 2 motifs)  
✅ Verifies everything works  

## Tables Created

**User Management:**
- accounts (user accounts)
- profiles (user details)
- account_sessions (login sessions)
- password_resets (password recovery)

**Catalog:**
- materials (granite, bronze, etc.)
- shapes (oval, heart, rectangle, etc.)
- borders (decorative borders)
- motifs (engravings)

**Projects:**
- projects (saved designs)
- project_assets (uploaded images)
- project_events (audit trail)

**Commerce:**
- orders (customer orders)
- order_items (line items)
- payments (payment records)

**Audit:**
- audit_log (system events)

## Troubleshooting

### "Missing environment variables"
→ Make sure you copied the database credentials to `.env.local`

### "Already exists" errors
→ Database was already set up. Run `npm run db:verify` to check.

### "Connection timeout"
→ Check your internet connection and try again.

### Still having issues?
→ See the detailed guide: `VERCEL_DATABASE_SETUP.md`

## Database Access

**View data in Vercel:**
1. Go to Vercel Dashboard → Storage
2. Click your database
3. Go to "Data" tab
4. Browse tables

**Use Drizzle Studio (local UI):**
```bash
npm run db:studio
```
Opens at: https://local.drizzle.studio

## Need More Data?

The setup includes minimal seed data. To add more:

1. Edit `sql/postgres-schema.sql`
2. Add more INSERT statements at the bottom
3. Run `npm run db:setup` again

Example:
```sql
INSERT INTO materials (slug, name, category, finish, thumbnail_url)
VALUES
  ('white-marble', 'White Marble', 'marble', 'polished', '/jpg/materials/white-marble.jpg')
ON CONFLICT (slug) DO NOTHING;
```

## Production Checklist

Before going live:

- [x] Database created on Vercel
- [x] Environment variables set
- [x] Schema deployed (`npm run db:setup`)
- [x] Verified setup (`npm run db:verify`)
- [x] Tested locally (`npm run dev`)
- [x] Committed changes (`git push`)
- [x] Tested on production URL

## Security Notes

✅ All passwords are hashed  
✅ SSL/TLS encryption enabled  
✅ SQL injection protection (parameterized queries)  
✅ Row-level security available (if needed)  
✅ Automatic backups by Vercel  

## Next Features

Once database is running, you can add:

- User registration/login
- Email notifications
- PDF quote generation
- Admin dashboard
- Order tracking
- Payment processing

## Support

- 📖 Full Guide: `VERCEL_DATABASE_SETUP.md`
- 🐛 Issues: Check logs with `vercel logs`
- 💬 Vercel Support: https://vercel.com/support
