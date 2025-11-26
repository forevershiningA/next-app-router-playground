/**
 * Utilities for deferring heavy work to idle time
 * Improves INP and TBT on slower devices
 * 
 * Note: These utilities are meant for client-side use only
 */

/**
 * Request idle callback with fallback for browsers that don't support it
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in globalThis) {
    return (globalThis as any).requestIdleCallback(callback, options);
  }
  // Fallback to setTimeout with a slight delay
  return setTimeout(() => {
    const start = Date.now();
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in globalThis) {
    (globalThis as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Run a function when the browser is idle, with a timeout
 * @param fn Function to run
 * @param timeout Maximum time to wait before running (default: 2000ms)
 */
export function runWhenIdle<T>(
  fn: () => T | Promise<T>,
  timeout = 2000
): Promise<T> {
  return new Promise((resolve, reject) => {
    requestIdleCallback(
      async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      { timeout }
    );
  });
}

/**
 * IntersectionObserver utility to run function when element is visible
 * @param element Element to observe
 * @param callback Function to run when visible
 * @param options IntersectionObserver options
 */
export function runWhenVisible(
  element: Element | null,
  callback: () => void,
  options?: IntersectionObserverInit
): () => void {
  if (!element || typeof IntersectionObserver === 'undefined') {
    // If no intersection observer support, run immediately
    callback();
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.01,
      ...options,
    }
  );

  observer.observe(element);

  return () => observer.disconnect();
}

/**
 * Combined utility: run when visible AND idle
 */
export function runWhenVisibleAndIdle(
  element: Element | null,
  fn: () => void | Promise<void>,
  idleTimeout = 2000
): () => void {
  let cleanup: (() => void) | null = null;

  cleanup = runWhenVisible(element, () => {
    runWhenIdle(fn, idleTimeout).catch(console.error);
  });

  return () => cleanup?.();
}
