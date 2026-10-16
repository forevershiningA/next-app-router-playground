import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_REPORT_BYTES = 16_384;

type CspReport = {
  'document-uri'?: string;
  'effective-directive'?: string;
  'violated-directive'?: string;
  'blocked-uri'?: string;
  'source-file'?: string;
  'line-number'?: number;
  documentURL?: string;
  effectiveDirective?: string;
  blockedURL?: string;
  sourceFile?: string;
  lineNumber?: number;
};

function safeLocation(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return `${url.origin}${url.pathname}`;
    }
    if (url.protocol === 'blob:') return `blob:${url.origin}`;
    return url.protocol;
  } catch {
    return value.split(/[?#]/, 1)[0].slice(0, 200);
  }
}

function summarizeReport(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const envelope = input as { 'csp-report'?: CspReport; body?: CspReport };
  const report =
    envelope['csp-report'] ?? envelope.body ?? (input as CspReport);
  if (typeof report !== 'object' || report === null) return null;

  return {
    document: safeLocation(report['document-uri'] ?? report.documentURL),
    directive:
      report['effective-directive'] ??
      report.effectiveDirective ??
      report['violated-directive'] ??
      'unknown',
    blocked: safeLocation(report['blocked-uri'] ?? report.blockedURL),
    source: safeLocation(report['source-file'] ?? report.sourceFile),
    line:
      typeof (report['line-number'] ?? report.lineNumber) === 'number'
        ? (report['line-number'] ?? report.lineNumber)
        : undefined,
  };
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  try {
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

    const payload = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    const reports = Array.isArray(payload) ? payload : [payload];
    for (const item of reports.slice(0, 20)) {
      const summary = summarizeReport(item);
      if (summary) console.warn('[CSP Report]', summary);
    }
  } catch {
    // Invalid reports are discarded so a reporting request never affects the page.
  }

  return new NextResponse(null, { status: 204 });
}
