import { NextRequest, NextResponse } from 'next/server';
import { getProjectRecord } from '#/lib/projects-db';
import { getServerSession } from '#/lib/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const record = await getProjectRecord(id, session.accountId);

  if (!record) {
    return NextResponse.json({ message: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project: record });
}
