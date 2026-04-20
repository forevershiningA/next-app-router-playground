/**
 * Main email sending function.
 *
 * Renders React Email templates to HTML, generates PDF attachments when needed,
 * and sends via Nodemailer with country-specific SMTP configuration.
 */

import { render } from '@react-email/components';
import { createElement } from 'react';
import { getCountryConfig } from './config/countries';
import { getTranslationMap } from './config/translations';
import { generateEmailPDF } from './pdf-email';
import { getTransporter } from './transport';
import type {
  EmailData,
  CountryEmailConfig,
  SendEmailResult,
  SavedDesignEmailData,
  OrderEmailData,
  EnquiryEmailData,
  RegistrationEmailData,
  PasswordResetEmailData,
} from './types';
import { SavedDesignEmail } from './templates/SavedDesignEmail';
import { OrderInvoiceEmail } from './templates/OrderInvoiceEmail';
import { EnquiryEmail } from './templates/EnquiryEmail';
import { RegistrationEmail } from './templates/RegistrationEmail';
import { PasswordResetEmail } from './templates/PasswordResetEmail';

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

async function renderTemplate(
  data: EmailData,
  config: CountryEmailConfig,
  translations: Record<string, string>,
): Promise<{ html: string; text: string }> {
  let element: React.ReactElement;

  switch (data.type) {
    case 'saved-design':
      element = createElement(SavedDesignEmail, { data, config, translations });
      break;
    case 'order':
      element = createElement(OrderInvoiceEmail, { data, config, translations });
      break;
    case 'enquiry':
      element = createElement(EnquiryEmail, { data, config, translations });
      break;
    case 'registration':
      element = createElement(RegistrationEmail, { data, config, translations });
      break;
    case 'password-reset':
      element = createElement(PasswordResetEmail, { data, config, translations });
      break;
  }

  const html = await render(element);
  const text = await render(element, { plainText: true });
  return { html, text };
}

// ---------------------------------------------------------------------------
// Subject generation
// ---------------------------------------------------------------------------

function getSubject(
  data: EmailData,
  translations: Record<string, string>,
): string {
  const t = (key: string) => translations[key] ?? key;

  switch (data.type) {
    case 'saved-design':
      return `${t('your_design_have_been_saved')}${data.designName} - ${data.recipientEmail}`;
    case 'order':
      return `${t('invoice')} - ${data.invoiceNumber} - ${data.recipientEmail}`;
    case 'enquiry':
      return `${t('enquiry')} - ${data.designName} - ${data.recipientEmail}`;
    case 'registration':
      return t('customer_registration');
    case 'password-reset':
      return t('reset_password') || 'Reset Your Password';
  }
}

// ---------------------------------------------------------------------------
// BCC resolution
// ---------------------------------------------------------------------------

function getBcc(
  data: EmailData,
  config: CountryEmailConfig,
): string[] {
  const bcc: string[] = [config.bcc.always];

  switch (data.type) {
    case 'saved-design':
      bcc.push(config.bcc.savedDesigns);
      break;
    case 'order':
      bcc.push(config.bcc.orders);
      break;
    case 'enquiry':
      bcc.push(config.bcc.admin);
      break;
    // registration & password-reset: no extra BCC
  }

  return Array.from(new Set(bcc)); // deduplicate
}

// ---------------------------------------------------------------------------
// PDF attachment
// ---------------------------------------------------------------------------

function generateAttachment(
  data: EmailData,
  config: CountryEmailConfig,
): { filename: string; content: Buffer } | null {
  if (data.type === 'saved-design') {
    const sd = data as SavedDesignEmailData;
    const pdfBuffer = generateEmailPDF(
      {
        title: 'Design Quote',
        designName: sd.designName,
        screenshotDataUri: sd.screenshotUrl,
        quoteItems: sd.quoteItems,
        totalCents: sd.totalCents,
        currency: sd.currency,
        customerEmail: sd.recipientEmail,
        customerName: sd.recipientName,
      },
      config,
    );
    return {
      filename: `saved-design-${sd.designId}.pdf`,
      content: pdfBuffer,
    };
  }

  if (data.type === 'order') {
    const od = data as OrderEmailData;
    const pdfBuffer = generateEmailPDF(
      {
        title: `Invoice - ${od.invoiceNumber}`,
        designName: od.designName,
        screenshotDataUri: od.screenshotUrl,
        quoteItems: od.quoteItems,
        totalCents: od.totalCents,
        currency: od.currency,
        subtotalCents: od.subtotalCents,
        taxCents: od.taxCents,
        invoiceNumber: od.invoiceNumber,
        customerEmail: od.recipientEmail,
        customerName: od.recipientName,
        customerAddress: od.customerAddress,
      },
      config,
    );
    return {
      filename: `invoice-${od.invoiceNumber}.pdf`,
      content: pdfBuffer,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main send function
// ---------------------------------------------------------------------------

/**
 * Send an email using the appropriate template, SMTP config, and PDF attachment.
 *
 * @param data - Type-discriminated email payload
 * @returns Result with success status and optional messageId
 */
export async function sendEmail(data: EmailData): Promise<SendEmailResult> {
  try {
    const config = getCountryConfig(data.countryCode);
    const locale = data.locale ?? config.language;
    const translations = getTranslationMap(locale);

    // Render template
    const { html, text } = await renderTemplate(data, config, translations);
    const subject = getSubject(data, translations);

    // Build mail options
    const from = `${config.company} <${config.email}>`;
    const bcc = getBcc(data, config);
    const attachment = generateAttachment(data, config);

    const mailOptions: Record<string, unknown> = {
      from,
      to: data.recipientEmail,
      replyTo: config.email,
      subject,
      html,
      text,
      bcc,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: attachment.content,
          contentType: 'application/pdf',
        },
      ];
    }

    // Send
    const transporter = getTransporter(data.countryCode);
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('[Email] Send failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
