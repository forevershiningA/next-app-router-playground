import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { enquiries } from '#/lib/db/schema';
import { getServerSession } from '#/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, projectId } = body as {
      name?: string;
      email: string;
      phone?: string;
      message: string;
      projectId?: string;
    };

    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    // Optionally attach to logged-in account
    let accountId: string | undefined;
    try {
      const session = await getServerSession();
      if (session?.accountId) accountId = session.accountId;
    } catch {
      // unauthenticated — fine
    }

    const fullMessage = name ? `From: ${name}\n\n${message}` : message;

    const [enquiry] = await db!
      .insert(enquiries)
      .values({
        email: email.trim(),
        phone: phone?.trim() || null,
        message: fullMessage.trim(),
        projectId: projectId || null,
        accountId: accountId || null,
        status: 'new',
      })
      .returning({ id: enquiries.id });

    return NextResponse.json({ id: enquiry.id }, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/enquiries error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}
