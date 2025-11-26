/**
 * Conditional logger that only logs in development
 * Reduces production bundle size and runtime overhead
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
};
