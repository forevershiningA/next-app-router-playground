import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '#/lib/auth/session';
import { db } from '#/lib/db/index';
import { accounts, profiles } from '#/lib/db/schema';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown; phone?: unknown };
    const email = String(body.email ?? '')
      .toLowerCase()
      .trim();
    const phone = String(body.phone ?? '')
      .replace(/[^0-9 +()\-]/g, '')
      .trim();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ status: 'invalid_email' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ status: 'invalid_phone' }, { status: 400 });
    }

    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.email, email),
    });
    if (existingAccount) {
      return NextResponse.json({ status: 'account_exists' }, { status: 409 });
    }

    // Internal credential only. It is never returned to the browser or emailed.
    const secretPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(secretPassword, 12);

    const account = await db.transaction(async (tx) => {
      const [createdAccount] = await tx
        .insert(accounts)
        .values({ email, passwordHash, role: 'client', status: 'active' })
        .returning();

      await tx
        .insert(profiles)
        .values({
          accountId: createdAccount.id,
          firstName: 'Guest',
          lastName: 'Customer',
          phone,
        });

      return createdAccount;
    });

    const token = await createSessionToken({
      accountId: account.id,
      email: account.email,
      role: account.role,
    });
    const response = NextResponse.json({ status: 'success' }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('[auth/guest-checkout] Account creation failed:', error);
    return NextResponse.json({ status: 'failed' }, { status: 500 });
  }
}
