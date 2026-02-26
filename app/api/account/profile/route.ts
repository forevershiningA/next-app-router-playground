import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db';
import { profiles, accounts } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.accountId, session.accountId),
    });

    const account = await db.query.accounts.findFirst({
      where: eq(accounts.id, session.accountId),
      columns: {
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      profile,
      account,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      currentPassword,
      newPassword,
    } = body;

    // Update profile
    if (firstName !== undefined || lastName !== undefined || phone !== undefined) {
      await db
        .update(profiles)
        .set({
          firstName,
          lastName,
          phone,
          updatedAt: new Date(),
        })
        .where(eq(profiles.accountId, session.accountId));
    }

    // Update email if changed
    if (email) {
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.id, session.accountId),
      });

      if (account && email !== account.email) {
        // Check if email is already taken
        const existingAccount = await db.query.accounts.findFirst({
          where: eq(accounts.email, email),
        });

        if (existingAccount) {
          return NextResponse.json(
            { error: 'Email already in use' },
            { status: 400 }
          );
        }

        await db
          .update(accounts)
          .set({ email, updatedAt: new Date() })
          .where(eq(accounts.id, session.accountId));
      }
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.id, session.accountId),
      });

      if (!account) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, account.passwordHash);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash and update new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      await db
        .update(accounts)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(accounts.id, session.accountId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
