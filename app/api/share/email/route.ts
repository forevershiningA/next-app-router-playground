import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from '#/lib/auth/session';
import { sendEmail } from '#/lib/email';
import { getCountryConfig } from '#/lib/email/config/countries';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, recipients, message, senderName } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'Project ID and message are required' },
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
    const config = getCountryConfig(countryCode);

    // Send enquiry email to the admin/company
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
