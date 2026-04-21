/**
 * Country email configuration.
 *
 * Source of truth: `public/xml/countries24.xml`.
 * At build time, `scripts/embed-email-xml.mjs` pre-parses that XML into
 * `./data/countries24.json` (the JSON import below) so the email runtime
 * never needs filesystem access or an XML parser. Regenerate the JSON after
 * editing the source XML:
 *
 *   node scripts/embed-email-xml.mjs
 */

import type { CountryEmailConfig } from '../types';
import countriesData from './data/countries24.json';

/** BCC addresses per country — from legacy dyo5.php send() */
const BCC_MAP: Record<string, CountryEmailConfig['bcc']> = {
  au: {
    savedDesigns: 'saveddesigns@forevershining.com.au',
    orders: 'orders@forevershining.com.au',
    admin: 'admin@forevershining.com.au',
    always: 'polcreation@gmail.com',
  },
  us: {
    savedDesigns: 'saveddesignsus@bronze-plaque.com',
    orders: 'admin@bronze-plaque.com',
    admin: 'admin@bronze-plaque.com',
    always: 'polcreation@gmail.com',
  },
  ca: {
    savedDesigns: 'saveddesignsus@bronze-plaque.com',
    orders: 'admin@bronze-plaque.com',
    admin: 'admin@bronze-plaque.com',
    always: 'polcreation@gmail.com',
  },
  pl: {
    savedDesigns: 'biuro@wiecznapamiec.pl',
    orders: 'biuro@wiecznapamiec.pl',
    admin: 'biuro@wiecznapamiec.pl',
    always: 'polcreation@gmail.com',
  },
  uk: {
    savedDesigns: 'biuro@wiecznapamiec.pl',
    orders: 'biuro@wiecznapamiec.pl',
    admin: 'biuro@wiecznapamiec.pl',
    always: 'polcreation@gmail.com',
  },
  eu: {
    savedDesigns: 'biuro@wiecznapamiec.pl',
    orders: 'biuro@wiecznapamiec.pl',
    admin: 'biuro@wiecznapamiec.pl',
    always: 'polcreation@gmail.com',
  },
};

const DEFAULT_BCC: CountryEmailConfig['bcc'] = {
  savedDesigns: 'saveddesigns@forevershining.com.au',
  orders: 'orders@forevershining.com.au',
  admin: 'admin@forevershining.com.au',
  always: 'polcreation@gmail.com',
};

let cachedCountries: Map<string, CountryEmailConfig> | null = null;

/**
 * Load country configs from the embedded JSON (cached).
 */
export function getCountryConfigs(): Map<string, CountryEmailConfig> {
  if (cachedCountries) return cachedCountries;

  const map = new Map<string, CountryEmailConfig>();
  for (const entry of countriesData as Omit<CountryEmailConfig, 'bcc'>[]) {
    const config: CountryEmailConfig = {
      ...entry,
      bcc: BCC_MAP[entry.code] ?? DEFAULT_BCC,
    };
    map.set(entry.code, config);
  }

  cachedCountries = map;
  return map;
}

/**
 * Get a single country config by code (e.g. 'au', 'us', 'pl').
 * Falls back to 'au' if not found.
 */
export function getCountryConfig(code: string): CountryEmailConfig {
  const configs = getCountryConfigs();
  return configs.get(code) ?? configs.get('au')!;
}
