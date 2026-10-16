'use client';

export type WebGLReportEvent =
  | 'unavailable'
  | 'context-lost'
  | 'context-restored';

export function reportWebGLEvent(event: WebGLReportEvent) {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify({
    event,
  });

  try {
    if (
      navigator.sendBeacon?.(
        '/api/client-webgl-report',
        new Blob([payload], { type: 'application/json' }),
      )
    ) {
      return;
    }
  } catch {
    // Fall through to fetch when beacon delivery is unavailable.
  }

  void fetch('/api/client-webgl-report', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => {
    // Telemetry must never affect the designer experience.
  });
}
