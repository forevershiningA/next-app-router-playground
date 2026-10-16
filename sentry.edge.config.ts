import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    databaseQueryData: false,
    queues: false,
    stackFrameVariables: false,
  },
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1 : 0.1,
  beforeSend(event) {
    if (event.request) {
      if (event.request.url) {
        try {
          const url = new URL(event.request.url);
          url.search = '';
          url.hash = '';
          event.request.url = url.toString();
        } catch {
          event.request.url = undefined;
        }
      }

      delete event.request.data;
      delete event.request.headers;
      delete event.user;
    }

    return event;
  },
});
