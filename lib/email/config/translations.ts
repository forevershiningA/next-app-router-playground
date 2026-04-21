/**
 * Email translations parsed from languages24.xml.
 *
 * Parses the full XML once and caches results. Provides a `t()` helper
 * that resolves a translation key for a given locale, falling back to 'au_EN'.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { DOMParser } from '@xmldom/xmldom';
import type { TranslationsByLocale } from '../types';

function parseLanguageElement(el: Element): Record<string, string> {
  const map: Record<string, string> = {};
  const children = el.childNodes;
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === 1) {
      // Element node
      const key = (node as Element).tagName;
      const value = node.textContent?.trim() ?? '';
      if (key && value) {
        map[key] = value;
      }
    }
  }
  return map;
}

let cachedTranslations: TranslationsByLocale | null = null;

/**
 * Load and parse all translations from languages24.xml.
 * Result is cached after first call.
 */
export function getTranslations(): TranslationsByLocale {
  if (cachedTranslations) return cachedTranslations;

  const xmlPath = join(__dirname, 'data', 'languages24.xml');
  const xmlContent = readFileSync(xmlPath, 'utf-8');
  const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
  const langElements = doc.getElementsByTagName('language');

  const translations: TranslationsByLocale = {};
  for (let i = 0; i < langElements.length; i++) {
    const el = langElements[i] as Element;
    const code = el.getAttribute('code');
    if (code) {
      translations[code] = parseLanguageElement(el);
    }
  }

  cachedTranslations = translations;
  return translations;
}

/**
 * Translate a key for a given locale.
 * Falls back to 'au_EN' if the key is missing in the requested locale.
 * Returns the key itself if not found in any locale.
 */
export function t(locale: string, key: string): string {
  const translations = getTranslations();
  return translations[locale]?.[key] ?? translations['au_EN']?.[key] ?? key;
}

/**
 * Get the full translation map for a locale.
 * Falls back to 'au_EN' if locale not found.
 */
export function getTranslationMap(
  locale: string,
): Record<string, string> {
  const translations = getTranslations();
  return translations[locale] ?? translations['au_EN'] ?? {};
}
