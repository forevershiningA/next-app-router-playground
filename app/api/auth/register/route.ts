import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '#/lib/db/index';
import { accounts, profiles } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSessionToken, setSessionCookie } from '#/lib/auth/session';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = String(email ?? '').toLowerCase().trim();
    const normalizedPassword = String(password ?? '');

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 },
      );
    }

    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.email, normalizedEmail),
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 10);

    const createdAccount = await db.transaction(async (tx) => {
      const [account] = await tx
        .insert(accounts)
        .values({
          email: normalizedEmail,
          passwordHash,
          role: 'client',
          status: 'active',
        })
        .returning();

      await tx.insert(profiles).values({
        accountId: account.id,
      });

      return account;
    });

    const token = await createSessionToken({
      accountId: createdAccount.id,
      email: createdAccount.email,
      role: createdAccount.role,
    });

    const response = NextResponse.json({
      success: true,
      role: createdAccount.role,
    });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
