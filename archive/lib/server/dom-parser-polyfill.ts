import 'server-only';

let domSupportPromise: Promise<void> | null = null;

export async function ensureServerDomParser() {
  if (typeof window !== 'undefined') {
    return;
  }

  if (!domSupportPromise) {
    domSupportPromise = import('linkedom').then(({ DOMParser }) => {
      if (typeof (globalThis as any).DOMParser === 'undefined') {
        (globalThis as any).DOMParser = DOMParser;
      }

      const globalCss = (globalThis as any).CSS ?? {};
      if (typeof globalCss.escape !== 'function') {
        globalCss.escape = (value: string) =>
          String(value).replace(/[^a-zA-Z0-9_\-]/g, (char) => `\\${char}`);
      }
      (globalThis as any).CSS = globalCss;
    });
  }

  await domSupportPromise;
}
