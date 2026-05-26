import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { payments } from '#/lib/db/schema';
import { getServerSession } from '#/lib/auth/session';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, provider, providerRef, amountCents, currency, status, receivedAt } = body as {
      orderId: string;
      provider: string;
      providerRef?: string | null;
      amountCents: number;
      currency?: string;
      status?: string;
      receivedAt?: string | null;
    };

    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    if (!amountCents || amountCents <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const [payment] = await db!
      .insert(payments)
      .values({
        orderId,
        provider: provider || 'Bank Transfer',
        providerRef: providerRef || null,
        amountCents,
        currency: currency || 'AUD',
        status: status || 'completed',
        receivedAt: receivedAt ? new Date(receivedAt) : null,
      })
      .returning();

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/admin/payments error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}
