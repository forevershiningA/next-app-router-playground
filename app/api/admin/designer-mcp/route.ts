import { NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store' };
  if (process.env.NEXT_PUBLIC_DESIGNER_MCP_LIVE_TEST !== '1')
    return NextResponse.json({ enabled: false }, { status: 404, headers });
  const session = await getServerSession();
  if (session?.role !== 'admin' || !session.accountId)
    return NextResponse.json({ enabled: false }, { status: 403, headers });
  return NextResponse.json({ enabled: true }, { headers });
}
