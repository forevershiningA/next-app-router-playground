import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '#/lib/db/index';
import { accounts, profiles } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from '#/lib/auth/session';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      email,
      password,
      role = 'client',
      firstName,
      lastName,
      phone,
      organization,
      businessName,
      tradingName,
      taxId,
      website,
      address,
      city,
      state,
      postcode,
      country = 'Australia',
    } = body as {
      email: string;
      password: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      organization?: string;
      businessName?: string;
      tradingName?: string;
      taxId?: string;
      website?: string;
      address?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.query.accounts.findFirst({
      where: eq(accounts.email, normalizedEmail),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [account] = await db
      .insert(accounts)
      .values({
        email: normalizedEmail,
        passwordHash,
        role,
        status: 'active',
      })
      .returning({ id: accounts.id });

    await db.insert(profiles).values({
      accountId: account.id,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      phone: phone ?? null,
      organization: organization ?? null,
      businessName: businessName ?? null,
      tradingName: tradingName ?? null,
      taxId: taxId ?? null,
      website: website ?? null,
      address: address ?? null,
      city: city ?? null,
      state: state ?? null,
      postcode: postcode ?? null,
      country,
    });

    return NextResponse.json({ id: account.id }, { status: 201 });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 },
    );
  }
}
