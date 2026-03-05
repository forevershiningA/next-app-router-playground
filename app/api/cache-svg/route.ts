/**
 * API Route: Cache SVG
 * 
 * POST /api/cache-svg
 * 
 * Saves a generated SVG to the cache directory.
 * Called by client after generating SVG.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = 'public/ml/forevershining/saved-designs/svg';

export async function POST(request: NextRequest) {
  try {
    const { designId, svg } = await request.json();
    
    if (!designId || !svg) {
      return NextResponse.json(
        { error: 'Missing designId or svg' },
        { status: 400 }
      );
    }

    // Validate designId is a numeric timestamp only — prevents path traversal
    const timestamp = parseInt(designId, 10);
    if (isNaN(timestamp) || timestamp <= 0 || String(timestamp) !== String(designId).trim()) {
      return NextResponse.json({ error: 'Invalid designId' }, { status: 400 });
    }
    const safeFilename = `${timestamp}.svg`;
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const cachePath = path.join(
      process.cwd(),
      CACHE_DIR,
      String(year),
      month,
      safeFilename
    );
    
    // Ensure directory exists
    const dir = path.dirname(cachePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write SVG file
    await fs.writeFile(cachePath, svg, 'utf-8');
    
    return NextResponse.json({
      success: true,
      path: `${year}/${month}/${safeFilename}`
    });
    
  } catch (error) {
    console.error('Failed to cache SVG:', error);
    return NextResponse.json(
      { error: 'Failed to cache SVG' },
      { status: 500 }
    );
  }
}
