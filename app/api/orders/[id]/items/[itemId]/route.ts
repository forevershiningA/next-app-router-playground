import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { orderItems } from '#/lib/db/schema';
import { requireAdminSession } from '#/app/admin/_components/admin-utils';

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    const { itemId } = await params;
    const body = (await request.json()) as { quantity?: number; unitPriceCents?: number };

    const update: Partial<{ quantity: number; unitPriceCents: number }> = {};
    if (typeof body.quantity === 'number') update.quantity = body.quantity;
    if (typeof body.unitPriceCents === 'number') update.unitPriceCents = body.unitPriceCents;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const [updated] = await db
      .update(orderItems)
      .set(update)
      .where(eq(orderItems.id, itemId))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error('Error updating order item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
