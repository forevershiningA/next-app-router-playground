import { NextRequest, NextResponse } from 'next/server';
import { listProjectSummaries, saveProjectRecord, deleteProjectRecord } from '#/lib/projects-db';
import type { DesignerSnapshot, PricingBreakdown } from '#/lib/project-schemas';

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
  const limitParam = request.nextUrl.searchParams.get('limit');
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const limit = Number.isNaN(parsedLimit)
    ? 20
    : Math.min(MAX_LIST_LIMIT, Math.max(1, parsedLimit));

  const projects = await listProjectSummaries(limit);
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
    const body = (await request.json()) as SaveProjectBody;

    if (!body.designState) {
      return NextResponse.json({ message: 'designState is required' }, { status: 400 });
    }

    const totalPriceCents = typeof body.totalPriceCents === 'number'
      ? Math.round(body.totalPriceCents)
      : null;
    const cleanedDesignState = cleanDesignState(body.designState);

    // Save design files first to get the screenshot and thumbnail paths
    let screenshotPath: string | null = null;
    let thumbnailPath: string | null = null;
    let tempSummary: any = null;
    
    try {
      const screenshotDataUrl = body.designState.metadata?.screenshot ?? undefined;
      const screenshotBuffer = decodeScreenshotDataUrl(screenshotDataUrl);

      // Create temporary project to get ID
      tempSummary = await saveProjectRecord({
        projectId: body.projectId,
        title: body.title ?? 'Untitled Design',
        status: body.status ?? 'draft',
        totalPriceCents,
        currency: body.currency ?? 'AUD',
        materialId: body.materialId ?? null,
        shapeId: body.shapeId ?? null,
        borderId: body.borderId ?? null,
        designState: cleanedDesignState,
        pricingBreakdown: body.pricingBreakdown ?? null,
      });

      if (process.env.VERCEL !== '1') {
        const { saveDesignFiles, designToXML, designToP3D, generatePriceQuoteHTML } = await import('#/lib/fileStorage');

        const designData = {
          id: tempSummary.id,
          name: tempSummary.title,
          productId: body.designState.productId,
          price: totalPriceCents ? totalPriceCents / 100 : 0,
          quote: `Design "${tempSummary.title}" - ${new Date().toLocaleDateString()}`,
          createdAt: tempSummary.createdAt,
          data: cleanedDesignState,
          screenshot: screenshotDataUrl || '',
        };

        const xmlData = designToXML(designData);
        const htmlData = generatePriceQuoteHTML(designData);
        const p3dData = designToP3D(designData);

        const filePaths = await saveDesignFiles(
          tempSummary.id,
          screenshotBuffer,
          cleanedDesignState,
          xmlData,
          htmlData,
          p3dData
        );

        screenshotPath = filePaths.screenshot;
        thumbnailPath = filePaths.thumbnail;
      } else if (screenshotDataUrl?.startsWith('data:image/')) {
        // Vercel serverless filesystem is ephemeral/read-only for this flow.
        // Persist screenshot previews as data URLs so My Account cards render correctly.
        screenshotPath = screenshotDataUrl;
        thumbnailPath = screenshotDataUrl;
      }
    } catch (fileError) {
      console.error('[api/projects] Failed to save design files:', fileError);
      console.error('[api/projects] Error details:', fileError instanceof Error ? fileError.message : fileError);
      console.error('[api/projects] Stack:', fileError instanceof Error ? fileError.stack : 'No stack trace');
    }

    // Ensure we have a tempSummary
    if (!tempSummary) {
      throw new Error('Failed to create project record');
    }

    // Now update with screenshot and thumbnail paths
    const summary = await saveProjectRecord({
      projectId: tempSummary.id, // Use the temp project ID to update it
      title: body.title ?? 'Untitled Design',
      status: body.status ?? 'draft',
      totalPriceCents,
      currency: body.currency ?? 'AUD',
      materialId: body.materialId ?? null,
      shapeId: body.shapeId ?? null,
      borderId: body.borderId ?? null,
      screenshotPath,
      thumbnailPath,
      designState: cleanedDesignState,
      pricingBreakdown: body.pricingBreakdown ?? null,
    });

    return NextResponse.json({ project: summary });
  } catch (error) {
    if (error instanceof Error && error.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    console.error('[api/projects] Failed to save project', error);
    return NextResponse.json({ message: 'Unable to save project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    const deleted = await deleteProjectRecord(projectId);

    if (!deleted) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('[api/projects] Failed to delete project', error);
    return NextResponse.json({ message: 'Unable to delete project' }, { status: 500 });
  }
}
