import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '#/lib/db/index';
import { enquiries, projects } from '#/lib/db/schema';
import { getServerSession } from '#/lib/auth/session';
import { sendEmail } from '#/lib/email';
import { getCountryConfig } from '#/lib/email/config/countries';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

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

    if (!email?.trim())
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!message?.trim())
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );

    // Optionally attach to logged-in account
    let accountId: string | undefined;
    try {
      const session = await getServerSession();
      if (session?.accountId) accountId = session.accountId;
    } catch {
      // unauthenticated — fine
    }

    const fullMessage = name ? `From: ${name}\n\n${message}` : message;
    const cleanEmail = email.trim();
    const cleanPhone = phone?.trim() || undefined;
    const cleanMessage = message.trim();
    const cleanName = name?.trim() || undefined;

    const project = projectId
      ? await db!.query.projects.findFirst({
          where: eq(projects.id, projectId),
        })
      : null;

    const [enquiry] = await db!
      .insert(enquiries)
      .values({
        email: cleanEmail,
        phone: cleanPhone || null,
        message: fullMessage.trim(),
        projectId: projectId || null,
        accountId: accountId || null,
        status: 'new',
      })
      .returning({ id: enquiries.id });

    after(async () => {
      const countryCode = 'au';
      const config = getCountryConfig(countryCode);
      const result = await sendEmail({
        type: 'enquiry',
        recipientEmail: config.email,
        recipientName: config.company,
        countryCode,
        designName: project?.title ?? 'Quick Enquiry',
        screenshotUrl: project?.screenshotPath ?? undefined,
        message: cleanMessage,
        customerEmail: cleanEmail,
        customerName: cleanName,
        customerPhone: cleanPhone,
      });

      if (!result.success) {
        console.error('[api/enquiries] Email send failed:', result.error);
      }
    });

    return NextResponse.json({ id: enquiry.id }, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/enquiries error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}
