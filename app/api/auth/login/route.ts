import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '#/lib/db/index';
import { accounts, profiles } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSessionToken, setSessionCookie } from '#/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const account = await db.query.accounts.findFirst({
      where: eq(accounts.email, email.toLowerCase().trim()),
    });

    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (account.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    const token = await createSessionToken({
      accountId: account.id,
      email: account.email,
      role: account.role,
    });

    // Update last login timestamp
    await db
      .update(accounts)
      .set({ lastLoginAt: new Date() })
      .where(eq(accounts.id, account.id));

    const response = NextResponse.json({ success: true, role: account.role });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
