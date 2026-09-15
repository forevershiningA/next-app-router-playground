import { NextResponse } from 'next/server';
import { sendEmail } from '#/lib/email';
import { getServerSession } from '#/lib/auth/session';
import type { EmailData } from '#/lib/email/types';

/**
 * POST /api/email — Send an email.
 *
 * Body is a type-discriminated EmailData object with a `type` field:
 *   'saved-design' | 'order' | 'enquiry' | 'registration' | 'password-reset'
 *
 * All supported types require authentication. Password resets must use
 * /api/auth/forgot-password, which generates the token and URL on the server.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmailData;

    // Validate required fields
    if (!body.type || !body.recipientEmail || !body.countryCode) {
      return NextResponse.json(
        { error: 'Missing required fields: type, recipientEmail, countryCode' },
        { status: 400 },
      );
    }

    if (body.type === 'password-reset') {
      return NextResponse.json(
        { error: 'Use the forgot-password endpoint to request a reset' },
        { status: 403 },
      );
    }

    const session = await getServerSession();
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate email type
    const validTypes = ['saved-design', 'order', 'enquiry', 'registration'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid email type: ${body.type}` },
        { status: 400 },
      );
    }

    const result = await sendEmail(body);

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    }

    return NextResponse.json(
      { error: result.error ?? 'Failed to send email' },
      { status: 500 },
    );
  } catch (error) {
    console.error('[API Email] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
