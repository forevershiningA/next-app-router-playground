// Both gallery entry points set this only after the saved design has loaded.
// Keeping it in memory prevents reloads or a second tab from replaying a start.
let pending: { designId: string; destination: string; cardPath: string } | undefined;

export function markReadyDesignStart(designId: string, destination: string) {
  pending = { designId, destination, cardPath: window.location.pathname };
}

export function recordReadyDesignArrival(pathname: string) {
  if (!pending || pathname === pending.cardPath) return;
  const start = pending;
  pending = undefined;
  if (pathname !== start.destination) return;

  const navigation = performance.getEntriesByType('navigation')[0];
  const landing = navigation ? new URL(navigation.name).pathname : '';
  const landingPath = /^\/designs(?:\/[a-z0-9-]+){0,3}\/?$/.test(landing)
    ? landing
    : 'other';
  const fromGoogle = /^https?:\/\/(?:www\.)?google\.(?:com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})\//i.test(document.referrer);

  void import('@sentry/nextjs').then(({ metrics }) => {
    metrics.count('ready_design.editor_open', 1, {
      attributes: {
        design_id: start.designId,
        landing_path: landingPath,
        google_referral: fromGoogle,
      },
    });
  }).catch(() => {
    // Telemetry is optional when the reporting bundle is unavailable.
  });
}
