import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const project = await db?.query.projects.findFirst({
    where: eq(projects.id, id),
  });

  if (!project) {
    return NextResponse.json({ message: 'Design not found' }, { status: 404 });
  }

  // Only expose what's needed to load into the designer — no user/billing data
  return NextResponse.json({
    id: project.id,
    title: project.title,
    designState: project.designState,
    metadata: {
      currentProjectId: project.id,
      currentProjectTitle: project.title,
    },
  });
}
