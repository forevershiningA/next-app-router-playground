import { after, NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db/index';
import { orders, orderItems, payments } from '#/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getProjectRecord } from '#/lib/projects-db';
import { calculateAuthoritativeQuote } from '#/lib/server/design-pricing';
import { sendEmail } from '#/lib/email';
import { countryToCode, detailedQuoteItems } from '#/lib/email/helpers';

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${y}${m}-${rand}`;
}

function isLocalRequest(request: NextRequest): boolean {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

type ShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  notes: string;
};

function readShippingDetails(value: unknown): ShippingDetails | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const readText = (field: keyof ShippingDetails, maxLength: number) => {
    const candidate = record[field];
    return typeof candidate === 'string'
      ? candidate.trim().slice(0, maxLength)
      : '';
  };
  const details: ShippingDetails = {
    fullName: readText('fullName', 120),
    email: readText('email', 320),
    phone: readText('phone', 40),
    address: readText('address', 240),
    city: readText('city', 120),
    state: readText('state', 120),
    postcode: readText('postcode', 24),
    country: readText('country', 120),
    notes: readText('notes', 2000),
  };
  return details.fullName &&
    details.email &&
    details.address &&
    details.city &&
    details.postcode
    ? details
    : null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      projectId: string;
      paymentMethod: 'stripe' | 'other';
      testOrder?: boolean;
      shippingDetails?: unknown;
    };

    const { projectId, paymentMethod } = body;
    const isTestOrder = body.testOrder === true && isLocalRequest(request);
    const shippingDetails = readShippingDetails(body.shippingDetails);

    if (
      !projectId ||
      !['stripe', 'other'].includes(paymentMethod) ||
      !shippingDetails
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const project = await getProjectRecord(projectId, session.accountId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let quote;
    try {
      quote = await calculateAuthoritativeQuote(project.designState);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Could not calculate order price',
        },
        { status: 422 },
      );
    }

    const totalCents = isTestOrder ? 100 : quote.totalCents;
    const subtotalCents = isTestOrder
      ? 100
      : Math.round(quote.breakdown.subtotal! * 100);
    const taxCents = isTestOrder ? 0 : Math.round(quote.breakdown.tax! * 100);

    const order = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(orders)
        .values({
          projectId,
          accountId: session.accountId,
          status: 'pending',
          subtotalCents,
          taxCents,
          totalCents,
          currency: quote.currency,
          invoiceNumber: generateInvoiceNumber(),
          customerEmail: shippingDetails.email,
          notes: shippingDetails.notes || null,
          shippingDetails,
          designSnapshot: {
            title: project.title,
            designState: project.designState,
            screenshotPath: project.screenshotPath,
            thumbnailPath: project.thumbnailPath,
            pricingBreakdown: quote.breakdown,
          },
        })
        .returning();

      await tx
        .insert(orderItems)
        .values({
          orderId: created.id,
          description: project.title,
          quantity: 1,
          unitPriceCents: totalCents,
        });
      await tx
        .insert(payments)
        .values({
          orderId: created.id,
          provider: paymentMethod,
          providerRef: null,
          amountCents: totalCents,
          currency: quote.currency,
          status: 'pending',
          receivedAt: null,
        });
      return created;
    });

    // Bank-transfer orders need a confirmation immediately. Build it entirely
    // from the authenticated project and server-side quote, never from client
    // supplied totals or customer-controlled order data.
    if (paymentMethod === 'other') {
      after(async () => {
        const result = await sendEmail({
          type: 'order',
          recipientEmail: shippingDetails.email,
          recipientName: shippingDetails.fullName,
          countryCode: countryToCode(shippingDetails.country),
          orderId: order.id,
          invoiceNumber: order.invoiceNumber ?? order.id,
          designName: project.title,
          screenshotUrl: project.screenshotPath ?? undefined,
          quoteItems: detailedQuoteItems({
            breakdown: quote.breakdown,
            designState: project.designState,
            totalCents,
            currency: quote.currency,
          }),
          subtotalCents,
          taxCents,
          totalCents,
          currency: quote.currency,
          customerAddress: [
            shippingDetails.address,
            shippingDetails.city,
            shippingDetails.state,
            shippingDetails.postcode,
            shippingDetails.country,
          ]
            .filter(Boolean)
            .join(', '),
        });
        if (!result.success) {
          console.error(
            '[api/orders] Confirmation email failed:',
            result.error,
          );
        }
      });
    }

    return NextResponse.json({
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders with related data
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.accountId, session.accountId),
      orderBy: [desc(orders.createdAt)],
      with: {
        // This will only work if you have relations defined in schema
        // For now, we'll fetch them separately
      },
    });

    // Fetch order items and payments for each order
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.query.orderItems.findMany({
          where: eq(orderItems.orderId, order.id),
        });

        const orderPayments = await db.query.payments.findMany({
          where: eq(payments.orderId, order.id),
        });

        return { ...order, items, payments: orderPayments };
      }),
    );

    return NextResponse.json({ orders: ordersWithDetails });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
