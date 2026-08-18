import { NextRequest, NextResponse } from 'next/server';
import { getProjectRecord, updateProjectTitle } from '#/lib/projects-db';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { title?: unknown };
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return NextResponse.json(
      { message: 'Project name is required' },
      { status: 400 },
    );
  }
  if (title.length > 120) {
    return NextResponse.json(
      { message: 'Project name must be 120 characters or fewer' },
      { status: 400 },
    );
  }

  const { id } = await params;
  const project = await updateProjectTitle(id, session.accountId, title);
  if (!project) {
    return NextResponse.json({ message: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
}
