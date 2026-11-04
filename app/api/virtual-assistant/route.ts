import { NextRequest, NextResponse } from 'next/server';
import {
  parseVirtualDesignerCommand,
  executeVirtualDesignerIntent,
  buildDeterministicDraft,
} from '#/lib/virtual-designer-assistant';
import { generateDraftSvgPreview } from '#/lib/virtual-designer-svg';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import fs from 'node:fs';

export const runtime = 'nodejs';

const PRODUCT_SLUGS: Record<string, string> = {
  '5': 'bronze-plaque',
  '124': 'traditional-engraved-headstone',
  '101': 'traditional-engraved-full-monument',
  '4': 'laser-etched-black-granite-headstone',
};

// Global in-memory draft cache for fast recovery across serverless requests
const draftCache = new Map<string, { snapshot: any; previewUrl: string }>();

async function createLocalMcpClient() {
  const cdpUrl = process.env.DESIGNER_MCP_CDP_URL || 'http://127.0.0.1:9222';
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve(process.cwd(), 'scripts/designer-mcp.mjs')],
    env: {
      ...process.env,
      DESIGNER_MCP_CDP_URL: cdpUrl,
      DESIGNER_MCP_DISABLE_UPLOADS: '1',
    },
  });
  const client = new Client({ name: 'virtual-designer-api', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  return { client, transport };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 1. Serve draft image or json if draftId is supplied
  const draftId = searchParams.get('draftId');
  const format = searchParams.get('format');
  if (draftId) {
    const safeId = draftId.replace(/[^a-zA-Z0-9-]/g, '');
    const cached = draftCache.get(safeId);

    let snapshot = cached?.snapshot;
    if (!snapshot) {
      const jsonPath = path.join(process.cwd(), 'output/mcp-local-drafts', `${safeId}.json`);
      if (fs.existsSync(jsonPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          snapshot = content.snapshot;
        } catch {}
      }
    }

    if (format === 'json') {
      if (snapshot) {
        return NextResponse.json({ snapshot });
      }
      return NextResponse.json({ error: 'Draft JSON not found' }, { status: 404 });
    }

    // Serve authentic 3D render JPG from the 3D configurator if available
    const imgPath = path.join(process.cwd(), 'output/mcp-local-drafts', `${safeId}.jpg`);
    if (fs.existsSync(imgPath)) {
      const buffer = fs.readFileSync(imgPath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Otherwise serve dynamic vector preview from snapshot (e.g. serverless live environments)
    if (snapshot) {
      const svg = generateDraftSvgPreview(snapshot);
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return NextResponse.json({ error: '3D preview not found' }, { status: 404 });
  }

  // 2. Otherwise dry-run parse command
  const command = searchParams.get('command') || '';
  if (!command.trim()) {
    return NextResponse.json({ error: 'Missing ?command= or ?draftId= parameter' }, { status: 400 });
  }

  const parsed = parseVirtualDesignerCommand(command);
  const slug = parsed.productId ? PRODUCT_SLUGS[parsed.productId] || 'bronze-plaque' : 'bronze-plaque';

  return NextResponse.json({
    mode: 'dry-run',
    parsed,
    designerHref: `/${slug}/inscriptions`,
    message: 'Parsed memorial intent (zero external tokens consumed).',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const command = typeof body.command === 'string' ? body.command.trim() : '';
    const dryRun = Boolean(body.dryRun);

    if (!command) {
      return NextResponse.json(
        { error: 'Missing required "command" field in request body.' },
        { status: 400 },
      );
    }

    const parsed = parseVirtualDesignerCommand(command);
    const slug = parsed.productId ? PRODUCT_SLUGS[parsed.productId] || 'bronze-plaque' : 'bronze-plaque';
    const designerHref = `/${slug}/inscriptions`;

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        parsed,
        designerHref,
        message: 'Design plan generated deterministically (zero external tokens).',
      });
    }

    // Multi-tier Execution:
    // Tier 1: Local MCP 3D Configurator Engine (Three.js WebGL via Playwright/CDP)
    // Attempted when explicitly enabled via ENABLE_LOCAL_MCP=1 or when a dedicated CDP worker is connected.
    const allowMcp = Boolean(
      process.env.DESIGNER_MCP_CDP_URL ||
      process.env.ENABLE_LOCAL_MCP === '1'
    );

    if (allowMcp) {
      let mcpConn: { client: Client; transport: any } | null = null;
      try {
        mcpConn = await createLocalMcpClient();
        const execution = await executeVirtualDesignerIntent(parsed, mcpConn.client);

        let snapshot = null;
        let imageData: string | null = null;

        if (execution.filePath && fs.existsSync(execution.filePath)) {
          try {
            const draftContent = JSON.parse(fs.readFileSync(execution.filePath, 'utf8'));
            snapshot = draftContent.snapshot;
          } catch {}
        }

        if (execution.previewPath && fs.existsSync(execution.previewPath)) {
          try {
            const imgBuf = fs.readFileSync(execution.previewPath);
            imageData = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;
          } catch {}
        }

        const previewUrl = execution.draftId ? `/api/virtual-assistant?draftId=${execution.draftId}` : null;

        if (execution.draftId && snapshot) {
          draftCache.set(execution.draftId, {
            snapshot,
            previewUrl: previewUrl || '',
          });
        }

        return NextResponse.json({
          ...execution,
          imageData,
          previewUrl,
          designerHref,
          snapshot,
        });
      } catch (mcpErr: any) {
        console.warn(
          '[virtual-assistant] MCP 3D configurator unavailable or disconnected, proceeding with instant 3D draft:',
          mcpErr?.message || mcpErr,
        );
      } finally {
        if (mcpConn) {
          await mcpConn.client.close().catch(() => {});
        }
      }
    }

    // Tier 0: Deterministic 3D Design Engine (Serverless & Live Production Ready)
    // Generates the full 3D DesignerSnapshot with exact stonemason coordinates, materials, and personalized text.
    const draft = buildDeterministicDraft(parsed);

    // Persist to in-memory cache for fast retrieval
    draftCache.set(draft.draftId, {
      snapshot: draft.snapshot,
      previewUrl: draft.previewUrl,
    });

    // Persist to local filesystem only when explicitly enabled (e.g. CLI/pilot benchmarks),
    // avoiding unnecessary disk writes and watcher triggers during live interactive usage
    if (process.env.PERSIST_MCP_DRAFTS === '1' || process.env.ENABLE_LOCAL_MCP === '1') {
      try {
        const dir = path.join(process.cwd(), 'output/mcp-local-drafts');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, `${draft.draftId}.json`),
          JSON.stringify(
            {
              version: 1,
              id: draft.draftId,
              title: draft.title,
              snapshot: draft.snapshot,
              savedAt: new Date().toISOString(),
            },
            null,
            2,
          ),
          'utf8',
        );
      } catch {
        // Ignore filesystem write errors on read-only environments
      }
    }

    return NextResponse.json({
      success: true,
      intent: draft.intent,
      productId: draft.productId,
      title: draft.title,
      message: draft.message,
      draftId: draft.draftId,
      previewUrl: draft.previewUrl,
      imageData: draft.imageData,
      designerHref: draft.designerHref,
      warnings: draft.warnings,
      executionTimeMs: draft.executionTimeMs,
      snapshot: draft.snapshot,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
      },
      { status: 500 },
    );
  }
}
