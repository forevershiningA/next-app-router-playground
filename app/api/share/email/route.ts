import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from '#/lib/auth/session';
import { sendEmail } from '#/lib/email';
import { getCountryConfig } from '#/lib/email/config/countries';
import { detailedQuoteItems } from '#/lib/email/helpers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, recipients, message, senderName } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const countryCode = 'au';

    // If recipients array provided, send the saved-design email to each recipient
    if (Array.isArray(recipients) && recipients.length > 0) {
      const results: { to: string; success: boolean; error?: string }[] = [];
      for (const recipient of recipients) {
        try {
          const payload = {
            type: 'saved-design',
            recipientEmail: recipient,
            recipientName: senderName ?? session.email,
            countryCode,
            designId: project.id,
            designName: project.title,
            screenshotUrl: project.screenshotPath ?? undefined,
            quoteItems: detailedQuoteItems({
              breakdown: project.pricingBreakdown ?? null,
              designState: project.designState ?? null,
              totalCents: project.totalPriceCents ?? 0,
              currency: project.currency ?? 'AUD',
            }),
            totalCents: project.totalPriceCents ?? 0,
            currency: project.currency ?? 'AUD',
          } as any;

          const res = await sendEmail(payload as any);
          results.push({ to: recipient, success: res.success, error: res.error });
        } catch (err: any) {
          results.push({ to: recipient, success: false, error: err?.message ?? String(err) });
        }
      }

      return NextResponse.json({ success: true, results });
    }

    // Fallback: send enquiry to configured admin email (legacy behaviour)
    const config = getCountryConfig(countryCode);

    const result = await sendEmail({
      type: 'enquiry',
      recipientEmail: config.email,
      recipientName: senderName ?? session.email,
      countryCode,
      designName: project.title,
      screenshotUrl: project.screenshotPath ?? undefined,
      message,
    });

    if (!result.success) {
      console.error('[api/share/email] Email send failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send enquiry email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
