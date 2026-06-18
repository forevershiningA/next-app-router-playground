import { NextRequest, NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { sharedDesigns, projects } from '#/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getServerSession } from '#/lib/auth/session';
import { generateShareAccessCode } from '#/lib/share-access';

const DEFAULT_EXPIRY_DAYS = 30;
const MAX_EXPIRY_DAYS = 90;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, expiresInDays } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
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

    if (project.accountId !== session.accountId && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate unique share token
    const shareToken = nanoid(32);
    const accessCode = generateShareAccessCode();
    const accessCodeHash = await bcrypt.hash(accessCode, 12);

    const requestedDays = Number.isFinite(Number(expiresInDays))
      ? Number(expiresInDays)
      : DEFAULT_EXPIRY_DAYS;
    const boundedDays = Math.min(
      MAX_EXPIRY_DAYS,
      Math.max(1, Math.floor(requestedDays)),
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + boundedDays);

    // Create shared design record
    await db
      .insert(sharedDesigns)
      .values({
        projectId,
        shareToken,
        accessCodeHash,
        expiresAt,
      });

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const shareUrl = `${baseUrl}/shared/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
      accessCode,
      expiresAt,
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
