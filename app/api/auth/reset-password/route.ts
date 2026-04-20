import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '#/lib/db/index';
import { accounts, passwordResets } from '#/lib/db/schema';
import { and, eq, isNull, gt } from 'drizzle-orm';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 },
      );
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 },
      );
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

    // Find valid, unconsumed reset token
    const resetRecord = await db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.tokenHash, tokenHash),
        isNull(passwordResets.consumedAt),
        gt(passwordResets.expiresAt, new Date()),
      ),
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    // Update password and mark token as consumed in a transaction
    await db.transaction(async (tx) => {
      await tx
        .update(accounts)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(accounts.id, resetRecord.accountId));

      await tx
        .update(passwordResets)
        .set({ consumedAt: new Date() })
        .where(eq(passwordResets.id, resetRecord.id));
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
