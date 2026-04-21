/**
 * Email translations.
 *
 * Source of truth: `public/xml/languages24.xml`.
 * At build time, `scripts/embed-email-xml.mjs` pre-parses that XML into
 * `./data/languages24.json`. The JSON is loaded lazily via dynamic import
 * so this sizeable payload is only pulled into the function that actually
 * sends an email, keeping cold-start/build time down.
 */

import type { TranslationsByLocale } from '../types';

let cachedTranslations: TranslationsByLocale | null = null;
let inflight: Promise<TranslationsByLocale> | null = null;

async function loadTranslations(): Promise<TranslationsByLocale> {
  if (cachedTranslations) return cachedTranslations;
  if (inflight) return inflight;

  inflight = import('./data/languages24.json').then((mod) => {
    const data = (mod.default ?? mod) as TranslationsByLocale;
    cachedTranslations = data;
    inflight = null;
    return data;
  });

  return inflight;
}

/**
 * Translate a key for a given locale.
 * Falls back to 'au_EN' if the key is missing in the requested locale.
 * Returns the key itself if not found in any locale.
 */
export async function t(locale: string, key: string): Promise<string> {
  const translations = await loadTranslations();
  return translations[locale]?.[key] ?? translations['au_EN']?.[key] ?? key;
}

/**
 * Get the full translation map for a locale.
 * Falls back to 'au_EN' if locale not found.
 */
export async function getTranslationMap(
  locale: string,
): Promise<Record<string, string>> {
  const translations = await loadTranslations();
  return translations[locale] ?? translations['au_EN'] ?? {};
}
