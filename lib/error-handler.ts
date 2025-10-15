// lib/error-handler.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export type ErrorHandler = (error: Error, context: string) => void;

export function createErrorHandler(
  onError?: (error: Error, context: string) => void,
): ErrorHandler {
  return (error: Error, context: string) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, error);
    }

    // Call custom error handler
    onError?.(error, context);

    // In production, you would log to an error tracking service
    // Example: Sentry.captureException(error, { tags: { context } });
  };
}

export const defaultErrorHandler = createErrorHandler();
