import { NextRequest, NextResponse } from 'next/server';
import { getProjectRecord } from '#/lib/projects-db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const record = await getProjectRecord(id);

  if (!record) {
    return NextResponse.json({ message: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project: record });
}
