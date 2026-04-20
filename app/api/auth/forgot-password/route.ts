import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '#/lib/db/index';
import { accounts, passwordResets } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '#/lib/email';

const RESET_TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email ?? '').toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });

    const account = await db.query.accounts.findFirst({
      where: eq(accounts.email, normalizedEmail),
    });

    if (!account) {
      return successResponse;
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await db.insert(passwordResets).values({
      accountId: account.id,
      tokenHash,
      expiresAt,
    });

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    // Fire-and-forget: send password reset email
    sendEmail({
      type: 'password-reset',
      recipientEmail: account.email,
      countryCode: 'au',
      resetUrl,
    }).catch((err) => console.error('[auth/forgot-password] Email send failed:', err));

    return successResponse;
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
