/**
 * Email system types — country config, SMTP settings, email payloads, translations.
 */

// ---------------------------------------------------------------------------
// Country / SMTP configuration (parsed from countries24.xml)
// ---------------------------------------------------------------------------

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for STARTTLS (587)
  user: string;
  pass: string;
}

export interface CountryEmailConfig {
  code: string; // 'au', 'us', 'uk', 'pl', 'eu', 'pg', 'nz', 'ca'
  name: string;
  language: string; // 'au_EN', 'us_EN', 'pl_PL', etc.
  currency: string;
  currencySymbol: string;
  currencyCode: string;
  currencySide: number; // 0 = before, 1 = after
  company: string;
  businessName: string;
  businessRegisterNumber: string;
  accountInfo: string;
  email: string;
  logo: string;
  link: string;
  privacy: string;
  // PDF / email content fields
  pdfName: string;
  pdfTitle: string;
  pdfCreated: string; // HTML
  pdfPowered: string; // HTML
  pdfCopyAddress: string;
  pdfCopyAddress2: string;
  pdfCopyAddress3: string;
  pdfCopyAddress4: string;
  pdfContact: string;
  pdfContact2: string; // HTML (email link)
  pdfContact3: string; // HTML (web link)
  pdfPayment: string;
  pdfReference: string;
  pdfCallUsCreditCard: string;
  pdfPaymentLogos: string; // HTML
  pdfSidenote: string;
  pdfHeader: string;
  pdfHeader2: string;
  // BCC routing
  bcc: {
    savedDesigns: string;
    orders: string;
    admin: string;
    always: string;
  };
}

// ---------------------------------------------------------------------------
// Translation map (parsed from languages24.xml)
// ---------------------------------------------------------------------------

/** Flat key-value map of translation strings for one language */
export type TranslationMap = Record<string, string>;

/** All translations keyed by language code (e.g. 'au_EN') */
export type TranslationsByLocale = Record<string, TranslationMap>;

// ---------------------------------------------------------------------------
// Email payloads — type-discriminated union
// ---------------------------------------------------------------------------

interface BaseEmailData {
  countryCode: string;
  recipientEmail: string;
  recipientName?: string;
  locale?: string; // override for language (defaults to country's language)
}

export interface SavedDesignEmailData extends BaseEmailData {
  type: 'saved-design';
  designId: string;
  designName: string;
  screenshotUrl?: string; // data URI or URL
  quoteItems: QuoteLineItem[];
  totalCents: number;
  currency: string;
}

export interface OrderEmailData extends BaseEmailData {
  type: 'order';
  orderId: string;
  invoiceNumber: string;
  designName: string;
  screenshotUrl?: string;
  quoteItems: QuoteLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  customerAddress?: string;
}

export interface EnquiryEmailData extends BaseEmailData {
  type: 'enquiry';
  designName: string;
  screenshotUrl?: string;
  message: string;
  productName?: string;
}

export interface RegistrationEmailData extends BaseEmailData {
  type: 'registration';
}

export interface PasswordResetEmailData extends BaseEmailData {
  type: 'password-reset';
  resetUrl: string;
}

export type EmailData =
  | SavedDesignEmailData
  | OrderEmailData
  | EnquiryEmailData
  | RegistrationEmailData
  | PasswordResetEmailData;

// ---------------------------------------------------------------------------
// Quote line items (shared across email types)
// ---------------------------------------------------------------------------

export interface QuoteLineItem {
  description: string;
  quantity?: number;
  unitPriceCents: number;
  totalCents: number;
}

// ---------------------------------------------------------------------------
// Send result
// ---------------------------------------------------------------------------

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
