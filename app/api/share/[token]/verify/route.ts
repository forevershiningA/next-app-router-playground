import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '#/lib/db/index';
import { sharedDesigns } from '#/lib/db/schema';
import { createShareAccessCookie } from '#/lib/share-access';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type Params = {
  params: Promise<{ token: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const { code } = (await request.json().catch(() => ({}))) as { code?: string };

  if (!/^\d{6}$/.test(code ?? '')) {
    return NextResponse.json({ error: 'Enter the 6-digit access code' }, { status: 400 });
  }

  const share = await db.query.sharedDesigns.findFirst({
    where: eq(sharedDesigns.shareToken, token),
  });

  if (!share || (share.expiresAt && share.expiresAt < new Date())) {
    return NextResponse.json({ error: 'Shared design not found' }, { status: 404 });
  }

  if (!share.accessCodeHash) {
    return NextResponse.json({ error: 'Shared design not found' }, { status: 404 });
  }

  if (share.lockedUntil && share.lockedUntil > new Date()) {
    return NextResponse.json(
      { error: 'Too many incorrect attempts. Please try again later.' },
      { status: 429 },
    );
  }

  const isValid = await bcrypt.compare(code!, share.accessCodeHash);

  if (!isValid) {
    const failedAccessAttempts = (share.failedAccessAttempts ?? 0) + 1;
    const lockedUntil =
      failedAccessAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        : null;

    await db
      .update(sharedDesigns)
      .set({ failedAccessAttempts, lockedUntil })
      .where(and(eq(sharedDesigns.id, share.id), eq(sharedDesigns.shareToken, token)));

    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  }

  await db
    .update(sharedDesigns)
    .set({ failedAccessAttempts: 0, lockedUntil: null })
    .where(and(eq(sharedDesigns.id, share.id), eq(sharedDesigns.shareToken, token)));

  const response = NextResponse.json({ success: true });
  createShareAccessCookie(response, token);
  return response;
}
