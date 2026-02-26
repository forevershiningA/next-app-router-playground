import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db';
import { profiles } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.accountId, session.accountId),
      columns: {
        tradingName: true,
        businessName: true,
        taxId: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        postcode: true,
        country: true,
      },
    });

    return NextResponse.json({ invoiceDetails: profile });
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice details' },
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
      tradingName,
      businessName,
      taxId,
      phone,
      website,
      address,
      city,
      state,
      postcode,
      country,
    } = body;

    await db
      .update(profiles)
      .set({
        tradingName,
        businessName,
        taxId,
        phone,
        website,
        address,
        city,
        state,
        postcode,
        country,
        updatedAt: new Date(),
      })
      .where(eq(profiles.accountId, session.accountId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating invoice details:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice details' },
      { status: 500 }
    );
  }
}
