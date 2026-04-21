// Parses public/xml/countries24.xml and public/xml/languages24.xml into
// pre-shaped JSON under lib/email/config/data/. The serverless email runtime
// then ships/loads those JSON files directly — no runtime XML parsing, and
// no filesystem reads under public/ (which Vercel excludes from the bundle).
//
// Regenerate after editing the source XMLs:
//   node scripts/embed-email-xml.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser } from '@xmldom/xmldom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const srcDir = join(repoRoot, 'public', 'xml');
const outDir = join(repoRoot, 'lib', 'email', 'config', 'data');
mkdirSync(outDir, { recursive: true });

function text(parent, tag) {
  const el = parent.getElementsByTagName(tag)[0];
  if (!el) return '';
  return (el.textContent ?? '').trim();
}

function parseCountries(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const countryEls = doc.getElementsByTagName('country');
  const list = [];
  for (let i = 0; i < countryEls.length; i++) {
    const el = countryEls[i];
    list.push({
      code: el.getAttribute('code') ?? '',
      name: el.getAttribute('name') ?? '',
      language: text(el, 'language'),
      currency: text(el, 'currency'),
      currencySymbol: text(el, 'currency_symbol'),
      currencyCode: text(el, 'currency_code'),
      currencySide: parseInt(text(el, 'currency_side') || '0', 10),
      company: text(el, 'company'),
      businessName: text(el, 'business_name'),
      businessRegisterNumber: text(el, 'business_register_number'),
      accountInfo: text(el, 'account'),
      email: text(el, 'email'),
      logo: text(el, 'logo'),
      link: text(el, 'link'),
      privacy: text(el, 'privacy'),
      pdfName: text(el, 'pdf_name'),
      pdfTitle: text(el, 'pdf_title'),
      pdfCreated: text(el, 'pdf_created'),
      pdfPowered: text(el, 'pdf_powered'),
      pdfCopyAddress: text(el, 'pdf_copy_address'),
      pdfCopyAddress2: text(el, 'pdf_copy_address_2'),
      pdfCopyAddress3: text(el, 'pdf_copy_address_3'),
      pdfCopyAddress4: text(el, 'pdf_copy_address_4'),
      pdfContact: text(el, 'pdf_contact'),
      pdfContact2: text(el, 'pdf_contact_2'),
      pdfContact3: text(el, 'pdf_contact_3'),
      pdfPayment: text(el, 'pdf_payment'),
      pdfReference: text(el, 'pdf_reference'),
      pdfCallUsCreditCard: text(el, 'pdf_call_us_credit_card'),
      pdfPaymentLogos: text(el, 'pdf_payment_logos'),
      pdfSidenote: text(el, 'pdf_sidenote'),
      pdfHeader: text(el, 'pdf_header'),
      pdfHeader2: text(el, 'pdf_header_2'),
    });
  }
  return list;
}

function parseLanguages(xml) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const langEls = doc.getElementsByTagName('language');
  const out = {};
  for (let i = 0; i < langEls.length; i++) {
    const el = langEls[i];
    const code = el.getAttribute('code');
    if (!code) continue;
    const map = {};
    const children = el.childNodes;
    for (let j = 0; j < children.length; j++) {
      const node = children[j];
      if (node.nodeType === 1) {
        const key = node.tagName;
        const value = (node.textContent ?? '').trim();
        if (key && value) map[key] = value;
      }
    }
    out[code] = map;
  }
  return out;
}

const countriesXml = readFileSync(join(srcDir, 'countries24.xml'), 'utf-8');
const languagesXml = readFileSync(join(srcDir, 'languages24.xml'), 'utf-8');

const countriesJson = parseCountries(countriesXml);
const languagesJson = parseLanguages(languagesXml);

writeFileSync(
  join(outDir, 'countries24.json'),
  JSON.stringify(countriesJson),
);
writeFileSync(
  join(outDir, 'languages24.json'),
  JSON.stringify(languagesJson),
);

console.log(
  `wrote countries24.json (${countriesJson.length} countries, ${
    JSON.stringify(countriesJson).length
  } bytes)`,
);
console.log(
  `wrote languages24.json (${Object.keys(languagesJson).length} locales, ${
    JSON.stringify(languagesJson).length
  } bytes)`,
);
