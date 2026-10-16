import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'nodejs';

const MAX_REPORT_BYTES = 1024;
const ALLOWED_EVENTS = new Set([
  'unavailable',
  'context-lost',
  'context-restored',
]);

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > MAX_REPORT_BYTES) {
      return new NextResponse(null, { status: 413 });
    }

    const reader = request.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 204 });

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REPORT_BYTES) {
        await reader.cancel();
        return new NextResponse(null, { status: 413 });
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const value = JSON.parse(new TextDecoder().decode(bytes)) as {
      event?: unknown;
    };
    if (typeof value.event !== 'string' || !ALLOWED_EVENTS.has(value.event)) {
      return new NextResponse(null, { status: 400 });
    }

    console.warn('[webgl-report]', { event: value.event });
    if (value.event !== 'context-restored') {
      Sentry.captureMessage(`Client WebGL ${value.event}`, {
        level: 'warning',
        tags: { subsystem: 'webgl', event: value.event },
      });
    }
  } catch {
    // Reports are best-effort and never affect the page.
  }

  return new NextResponse(null, { status: 204 });
}
