/**
 * Country email configuration parsed from countries24.xml at build/startup time.
 *
 * We parse the XML once and cache the result. Each country entry provides
 * branding, SMTP routing, contact info, and BCC addresses for email dispatch.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { DOMParser } from '@xmldom/xmldom';
import type { CountryEmailConfig } from '../types';

function getTextContent(parent: Element, tagName: string): string {
  const el = parent.getElementsByTagName(tagName)[0];
  if (!el) return '';
  return el.textContent?.trim() ?? '';
}

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
};

const DEFAULT_BCC: CountryEmailConfig['bcc'] = {
  savedDesigns: 'saveddesigns@forevershining.com.au',
  orders: 'orders@forevershining.com.au',
  admin: 'admin@forevershining.com.au',
  always: 'polcreation@gmail.com',
};

function parseCountryElement(el: Element): CountryEmailConfig {
  const code = el.getAttribute('code') ?? '';
  return {
    code,
    name: el.getAttribute('name') ?? '',
    language: getTextContent(el, 'language'),
    currency: getTextContent(el, 'currency'),
    currencySymbol: getTextContent(el, 'currency_symbol'),
    currencyCode: getTextContent(el, 'currency_code'),
    currencySide: parseInt(getTextContent(el, 'currency_side') || '0', 10),
    company: getTextContent(el, 'company'),
    businessName: getTextContent(el, 'business_name'),
    businessRegisterNumber: getTextContent(el, 'business_register_number'),
    accountInfo: getTextContent(el, 'account'),
    email: getTextContent(el, 'email'),
    logo: getTextContent(el, 'logo'),
    link: getTextContent(el, 'link'),
    privacy: getTextContent(el, 'privacy'),
    pdfName: getTextContent(el, 'pdf_name'),
    pdfTitle: getTextContent(el, 'pdf_title'),
    pdfCreated: getTextContent(el, 'pdf_created'),
    pdfPowered: getTextContent(el, 'pdf_powered'),
    pdfCopyAddress: getTextContent(el, 'pdf_copy_address'),
    pdfCopyAddress2: getTextContent(el, 'pdf_copy_address_2'),
    pdfCopyAddress3: getTextContent(el, 'pdf_copy_address_3'),
    pdfCopyAddress4: getTextContent(el, 'pdf_copy_address_4'),
    pdfContact: getTextContent(el, 'pdf_contact'),
    pdfContact2: getTextContent(el, 'pdf_contact_2'),
    pdfContact3: getTextContent(el, 'pdf_contact_3'),
    pdfPayment: getTextContent(el, 'pdf_payment'),
    pdfReference: getTextContent(el, 'pdf_reference'),
    pdfCallUsCreditCard: getTextContent(el, 'pdf_call_us_credit_card'),
    pdfPaymentLogos: getTextContent(el, 'pdf_payment_logos'),
    pdfSidenote: getTextContent(el, 'pdf_sidenote'),
    pdfHeader: getTextContent(el, 'pdf_header'),
    pdfHeader2: getTextContent(el, 'pdf_header_2'),
    bcc: BCC_MAP[code] ?? DEFAULT_BCC,
  };
}

let cachedCountries: Map<string, CountryEmailConfig> | null = null;

/**
 * Load and parse all country configs from countries24.xml.
 * Result is cached after first call.
 */
export function getCountryConfigs(): Map<string, CountryEmailConfig> {
  if (cachedCountries) return cachedCountries;

  const xmlPath = join(process.cwd(), 'public', 'xml', 'countries24.xml');
  const xmlContent = readFileSync(xmlPath, 'utf-8');
  const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');
  const countryElements = doc.getElementsByTagName('country');

  const map = new Map<string, CountryEmailConfig>();
  for (let i = 0; i < countryElements.length; i++) {
    const config = parseCountryElement(countryElements[i] as Element);
    map.set(config.code, config);
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
