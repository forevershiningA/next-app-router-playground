import { NextRequest, NextResponse, after } from 'next/server';
import { listProjectSummaries, saveProjectRecord, deleteProjectRecord } from '#/lib/projects-db';
import type { DesignerSnapshot, PricingBreakdown } from '#/lib/project-schemas';
import { getServerSession } from '#/lib/auth/session';
import { sendEmail } from '#/lib/email';
import { detailedQuoteItems } from '#/lib/email/helpers';
import { uploadToStorage } from '#/lib/upload/proxy';

export const runtime = 'nodejs';

const MAX_LIST_LIMIT = 50;

// Helper function to remove base64 encoded images from design state
function cleanDesignState(designState: DesignerSnapshot): DesignerSnapshot {
  const cleaned = { ...designState };
  
  // Remove screenshot from metadata
  if (cleaned.metadata?.screenshot) {
    cleaned.metadata = {
      ...cleaned.metadata,
      screenshot: undefined,
    };
  }
  
  // Remove base64 data from selected images if they exist
  if (cleaned.selectedImages && Array.isArray(cleaned.selectedImages)) {
    cleaned.selectedImages = cleaned.selectedImages.map((img: any) => ({
      ...img,
      data: img.url || img.data, // Keep URL, remove base64 data
    }));
  }
  
  return cleaned;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const limit = Number.isNaN(parsedLimit)
    ? 20
    : Math.min(MAX_LIST_LIMIT, Math.max(1, parsedLimit));

  const projects = await listProjectSummaries(session.accountId, limit);
  return NextResponse.json({ projects });
}

type SaveProjectBody = {
  projectId?: string;
  title?: string;
  status?: string;
  totalPriceCents?: number;
  currency?: string;
  materialId?: number | null;
  shapeId?: number | null;
  borderId?: number | null;
  designState?: DesignerSnapshot;
  pricingBreakdown?: PricingBreakdown | null;
};

function decodeScreenshotDataUrl(raw: string | undefined): Buffer {
  if (!raw) return Buffer.alloc(0);
  const normalized = raw.trim();
  const match = normalized.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=]+)$/);
  if (!match?.[1]) {
    return Buffer.alloc(0);
  }

  try {
    const buffer = Buffer.from(match[1], 'base64');
    return buffer.length > 0 ? buffer : Buffer.alloc(0);
  } catch {
    return Buffer.alloc(0);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as SaveProjectBody;

    if (!body.designState) {
      return NextResponse.json({ message: 'designState is required' }, { status: 400 });
    }

    const totalPriceCents = typeof body.totalPriceCents === 'number'
      ? Math.round(body.totalPriceCents)
      : null;
    const cleanedDesignState = cleanDesignState(body.designState);

    // Capture screenshot data URL before it's stripped from the design state.
    // Store it directly in screenshotPath/thumbnailPath so the thumbnail is
    // immediately visible even if the background file upload never runs.
    const screenshotDataUrl = body.designState.metadata?.screenshot ?? undefined;
    const screenshotBuffer = decodeScreenshotDataUrl(screenshotDataUrl);
    const initialScreenshotPath = screenshotDataUrl || null;

    // Save to DB immediately — fast path, screenshot stored as data URL fallback
    const summary = await saveProjectRecord({
      accountId: session.accountId,
      projectId: body.projectId,
      title: body.title ?? 'Untitled Design',
      status: body.status ?? 'draft',
      totalPriceCents,
      currency: body.currency ?? 'AUD',
      materialId: body.materialId ?? null,
      shapeId: body.shapeId ?? null,
      borderId: body.borderId ?? null,
      screenshotPath: initialScreenshotPath,
      thumbnailPath: initialScreenshotPath,
      designState: cleanedDesignState,
      pricingBreakdown: body.pricingBreakdown ?? null,
    });

    // Upload screenshot, thumbnail and JSON AFTER the response is sent.
    // Uses Next.js 15 after() so Vercel function timeout doesn't block the client.
    // If upload succeeds, overwrites the data URL with a proper file path.
    const savedProjectId = summary.id;
    const savedAccountId = session.accountId;

    after(async () => {
      try {
        let screenshotPath: string | null = null;
        let thumbnailPath: string | null = null;
        let jsonPath: string | null = null;

        if (screenshotBuffer.length > 0) {
          screenshotPath = await uploadToStorage(
            new File([new Uint8Array(screenshotBuffer)], `design_${savedProjectId}.jpg`, { type: 'image/jpeg' }),
            'screenshots',
          );
          try {
            const sharp = (await import('sharp')).default;
            const thumbBuffer = await sharp(screenshotBuffer)
              .resize(300, 200, { fit: 'cover' })
              .jpeg({ quality: 80 })
              .toBuffer();
            thumbnailPath = await uploadToStorage(
              new File([new Uint8Array(thumbBuffer)], `thumb_${savedProjectId}.jpg`, { type: 'image/jpeg' }),
              'screenshots',
            );
          } catch {
            thumbnailPath = screenshotPath;
          }
        }

        const jsonBuffer = Buffer.from(JSON.stringify(cleanedDesignState, null, 2));
        jsonPath = await uploadToStorage(
          new File([jsonBuffer], `design_${savedProjectId}.json`, { type: 'application/json' }),
          'designs',
        );

        if (screenshotPath || jsonPath) {
          await saveProjectRecord({
            accountId: savedAccountId,
            projectId: savedProjectId,
            title: summary.title,
            status: summary.status,
            totalPriceCents: summary.totalPriceCents,
            currency: summary.currency,
            screenshotPath,
            thumbnailPath,
            jsonPath,
            designState: cleanedDesignState,
            pricingBreakdown: body.pricingBreakdown ?? null,
          });
        }
      } catch (uploadErr) {
        console.error('[api/projects] Background upload failed:', uploadErr);
      }
    });

    after(async () => {
      const result = await sendEmail({
        type: 'saved-design',
        recipientEmail: session.email,
        recipientName: session.email, // name not in session; template extracts local-part before @
        countryCode: 'au',
        designId: summary.id,
        designName: summary.title,
        screenshotUrl: screenshotDataUrl, // base64 data URI; sendEmail converts it to CID inline attachment
        quoteItems: detailedQuoteItems({
          breakdown: body.pricingBreakdown,
          designState: cleanedDesignState,
          totalCents: summary.totalPriceCents,
          currency: summary.currency,
        }),
        totalCents: summary.totalPriceCents ?? 0,
        currency: summary.currency,
      });

      if (!result.success) {
        console.error('[api/projects] Email send failed:', result.error);
      }
    });

    return NextResponse.json({ project: summary });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    console.error('[api/projects] Failed to save project', error);
    return NextResponse.json({
      message: 'Unable to save project',
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    const deleted = await deleteProjectRecord(projectId, session.accountId);

    if (!deleted) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('[api/projects] Failed to delete project', error);
    return NextResponse.json({ message: 'Unable to delete project' }, { status: 500 });
  }
}
