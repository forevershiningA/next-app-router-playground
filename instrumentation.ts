import type { Instrumentation } from 'next';
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

function getErrorIdentity(error: unknown) {
  if (!error || typeof error !== 'object') {
    return { name: 'UnknownError', digest: undefined };
  }

  const candidate = error as { name?: unknown; digest?: unknown };
  return {
    name:
      typeof candidate.name === 'string'
        ? candidate.name.slice(0, 100)
        : 'Error',
    digest:
      typeof candidate.digest === 'string'
        ? candidate.digest.slice(0, 100)
        : undefined,
  };
}

function getPathname(path: string) {
  try {
    return new URL(path, 'http://localhost').pathname;
  } catch {
    return '/unknown';
  }
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  Sentry.captureRequestError(error, request, context);

  const identity = getErrorIdentity(error);

  console.error(
    '[request-error]',
    JSON.stringify({
      ...identity,
      method: request.method,
      path: getPathname(request.path),
      router: context.routerKind,
      route: context.routePath,
      type: context.routeType,
      timestamp: new Date().toISOString(),
    }),
  );
};
