import { NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }
  return NextResponse.json({
    session: { accountId: session.accountId, email: session.email, role: session.role },
  });
}
