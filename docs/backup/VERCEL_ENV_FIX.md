# Fix for Design Loading Error on Production

## Problem
Design pages return 404 errors on live site: "Design not found. It may have been removed or the link is invalid."

Works on localhost but fails on forevershining.org.

## Root Cause
Server-side code in `page.tsx` uses `process.env.NEXT_PUBLIC_BASE_URL` to fetch design JSON files:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/ml/${mlDir}/saved-designs/json/${designId}.json`);
```

This variable is **not set** in Vercel production environment.

## Solution: Add Environment Variable to Vercel

### Option A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Select your project (next-dyo)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://forevershining.org`
   - **Environments**: Select **Production**, **Preview**, and **Development**
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment

### Option B: Via Vercel CLI
```bash
vercel env add NEXT_PUBLIC_BASE_URL
# Enter value: https://forevershining.org
# Select environments: Production, Preview, Development

# Redeploy
vercel --prod
```

### Option C: Add to .env.local and Push (Not Recommended)
This file is gitignored, but you can add it to `.env.production`:

```bash
# .env.production
NEXT_PUBLIC_BASE_URL=https://forevershining.org
```

Then commit and push.

## Verification
After redeployment, visit:
https://forevershining.org/designs/traditional-headstone/mother-memorial/curved-gable-cross

Should now load without errors.

## Why This Works
- **Localhost**: `NEXT_PUBLIC_BASE_URL` is empty → fetches from relative path `/ml/...` → works
- **Production (before fix)**: `NEXT_PUBLIC_BASE_URL` is empty → same relative path but server-side fetch context is different → fails
- **Production (after fix)**: `NEXT_PUBLIC_BASE_URL=https://forevershining.org` → fetches from absolute URL → works

## Alternative Fix (Code Change)
If you can't access Vercel dashboard, edit `app/designs/[productType]/[category]/[slug]/page.tsx`:

Change line 30 from:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/ml/${mlDir}/saved-designs/json/${designId}.json`);
```

To:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window === 'undefined' ? 'https://forevershining.org' : '');
const response = await fetch(`${baseUrl}/ml/${mlDir}/saved-designs/json/${designId}.json`);
```

This hardcodes the production URL as fallback for server-side rendering.
