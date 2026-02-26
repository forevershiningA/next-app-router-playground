import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db';
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

    // TODO: Implement actual email sending
    // This is a placeholder - you would integrate with SendGrid, Resend, or similar
    console.log('Would send email to:', recipients);
    console.log('Project:', project.title);
    console.log('Message:', message);
    console.log('Sender:', senderName);

    // For now, just return success
    // In production, you'd call an email service here
    /*
    const emailService = new EmailService();
    for (const email of recipients) {
      await emailService.send({
        to: email,
        subject: `${senderName} shared a memorial design with you`,
        html: `
          <p>${message}</p>
          <h3>${project.title}</h3>
          <img src="${project.screenshot}" alt="Design preview" />
          <a href="${shareUrl}">View Design</a>
        `
      });
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      recipientCount: recipients.length,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
