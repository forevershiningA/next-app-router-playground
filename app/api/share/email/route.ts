import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { projectId, recipients, message, senderName } = await request.json();

    if (!projectId || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and recipients are required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Email sending is not yet implemented.
    // Integrate with SendGrid, Resend, or similar before enabling.
    return NextResponse.json(
      { error: 'Email sharing is not yet available.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
