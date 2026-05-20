import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { accounts, profiles } from '#/lib/db/schema';
import { ilike, or, eq } from 'drizzle-orm';
import { getServerSession } from '#/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();

  try {
    const rows = await db
      .select({
        id: accounts.id,
        email: accounts.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        organization: profiles.organization,
      })
      .from(accounts)
      .leftJoin(profiles, eq(profiles.accountId, accounts.id))
      .where(
        q
          ? or(
              ilike(accounts.email, `%${q}%`),
              ilike(profiles.firstName, `%${q}%`),
              ilike(profiles.lastName, `%${q}%`),
              ilike(profiles.organization, `%${q}%`),
            )
          : undefined,
      )
      .limit(20);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Customer search error:', error);
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 },
    );
  }
}
