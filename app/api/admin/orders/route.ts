import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { accounts, orderItems, orders, projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from '#/lib/auth/session';

interface LineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customerEmail,
      invoiceNumber,
      status = 'quote',
      currency = 'AUD',
      taxPercent = 0,
      notes,
      items,
    } = body as {
      customerEmail: string;
      invoiceNumber?: string;
      status?: string;
      currency?: string;
      taxPercent?: number;
      notes?: string;
      items: LineItem[];
    };

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 },
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 },
      );
    }

    const account = await db.query.accounts.findFirst({
      where: eq(accounts.email, customerEmail.toLowerCase().trim()),
    });

    if (!account) {
      return NextResponse.json(
        { error: `No account found for email: ${customerEmail}` },
        { status: 404 },
      );
    }

    // Calculate totals
    const subtotalCents = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0,
    );
    const taxCents = Math.round(subtotalCents * (taxPercent / 100));
    const totalCents = subtotalCents + taxCents;

    // Create a stub project to satisfy the orders FK
    const [project] = await db
      .insert(projects)
      .values({
        accountId: account.id,
        title: notes
          ? `Custom Order — ${notes.slice(0, 60)}`
          : 'Custom Order (admin created)',
        status: 'draft',
        designState: {},
        pricingBreakdown: {},
      })
      .returning({ id: projects.id });

    // Create the order
    const [order] = await db
      .insert(orders)
      .values({
        projectId: project.id,
        accountId: account.id,
        status,
        subtotalCents,
        taxCents,
        totalCents,
        currency,
        invoiceNumber: invoiceNumber ?? null,
      })
      .returning({ id: orders.id });

    // Create order items
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        description: item.description,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
    );

    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}
