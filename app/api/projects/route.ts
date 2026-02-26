import { NextRequest, NextResponse } from 'next/server';
import { listProjectSummaries, saveProjectRecord, deleteProjectRecord } from '#/lib/projects-db';
import type { DesignerSnapshot, PricingBreakdown } from '#/lib/project-schemas';
import { saveDesignFiles, designToXML, designToP3D, generatePriceQuoteHTML } from '#/lib/fileStorage';

const MAX_LIST_LIMIT = 50;

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveProjectBody;

    if (!body.designState) {
      return NextResponse.json({ message: 'designState is required' }, { status: 400 });
    }

    const totalPriceCents = typeof body.totalPriceCents === 'number'
      ? Math.round(body.totalPriceCents)
      : null;

    // Save design files first to get the screenshot path
    let screenshotPath: string | null = null;
    
    try {
      const screenshotDataUrl = body.designState.metadata?.screenshot;
      let screenshotBuffer: Buffer;
      
      if (screenshotDataUrl && screenshotDataUrl.startsWith('data:image/png;base64,')) {
        const base64Data = screenshotDataUrl.replace('data:image/png;base64,', '');
        screenshotBuffer = Buffer.from(base64Data, 'base64');
      } else {
        screenshotBuffer = Buffer.from('');
      }

      // Create temporary project to get ID
      const tempSummary = await saveProjectRecord({
        projectId: body.projectId,
        title: body.title ?? 'Untitled Design',
        status: body.status ?? 'draft',
        totalPriceCents,
        currency: body.currency ?? 'AUD',
        materialId: body.materialId ?? null,
        shapeId: body.shapeId ?? null,
        borderId: body.borderId ?? null,
        designState: body.designState,
        pricingBreakdown: body.pricingBreakdown ?? null,
      });

      const designData = {
        id: tempSummary.id,
        name: tempSummary.title,
        productId: body.designState.productId,
        price: totalPriceCents ? totalPriceCents / 100 : 0,
        quote: `Design "${tempSummary.title}" - ${new Date().toLocaleDateString()}`,
        createdAt: tempSummary.createdAt,
        data: body.designState,
        screenshot: screenshotDataUrl || '',
      };

      const xmlData = designToXML(designData);
      const htmlData = generatePriceQuoteHTML(designData);
      const p3dData = designToP3D(designData);

      const filePaths = await saveDesignFiles(
        tempSummary.id,
        screenshotBuffer,
        body.designState,
        xmlData,
        htmlData,
        p3dData
      );
      
      screenshotPath = filePaths.screenshot;
    } catch (fileError) {
      console.error('[api/projects] Failed to save design files:', fileError);
    }

    // Now update with screenshot path
    const summary = await saveProjectRecord({
      projectId: body.projectId,
      title: body.title ?? 'Untitled Design',
      status: body.status ?? 'draft',
      totalPriceCents,
      currency: body.currency ?? 'AUD',
      materialId: body.materialId ?? null,
      shapeId: body.shapeId ?? null,
      borderId: body.borderId ?? null,
      screenshotPath,
      designState: body.designState,
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
