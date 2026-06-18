import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from '#/lib/auth/session';
import { getProjectRecord } from '#/lib/projects-db';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const body = (await request.json()) as {
      projectId: string;
      customerEmail: string;
    };

    const { projectId, customerEmail } = body;
    const project = await getProjectRecord(projectId, session.accountId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const amountCents = project.totalPriceCents ?? 0;
    const currency = project.currency ?? 'AUD';

    if (amountCents <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://forevershining.org';

    // Only pass image URLs that are absolute (Stripe requires full URLs)
    const images =
      project.screenshotPath && project.screenshotPath.startsWith('http')
        ? [project.screenshotPath]
        : undefined;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name: project.title,
              ...(images ? { images } : {}),
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/my-account/designs/${projectId}/buy?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-account/designs/${projectId}/buy?payment=cancel`,
      metadata: { projectId, accountId: session.accountId },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (err) {
    console.error('Stripe session error:', err);
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
  }
}
