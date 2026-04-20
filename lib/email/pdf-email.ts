/**
 * Server-side PDF generation for email attachments.
 *
 * This is a simplified PDF generator that runs in Node.js (no browser APIs).
 * It creates quote/invoice PDFs using jsPDF and returns a Buffer.
 */

import { jsPDF } from 'jspdf';
import type { CountryEmailConfig, QuoteLineItem } from './types';

interface EmailPDFData {
  title: string;
  designName: string;
  screenshotDataUri?: string; // data:image/png;base64,... or data:image/jpeg;base64,...
  quoteItems: QuoteLineItem[];
  totalCents: number;
  currency: string;
  subtotalCents?: number;
  taxCents?: number;
  invoiceNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
}

const C = {
  white: [255, 255, 255] as [number, number, number],
  black: [20, 20, 20] as [number, number, number],
  text: [35, 35, 35] as [number, number, number],
  muted: [90, 90, 90] as [number, number, number],
  border: [190, 190, 190] as [number, number, number],
  gold: [222, 189, 104] as [number, number, number],
};

function formatCurrency(cents: number, symbol: string): string {
  const amount = (cents / 100).toFixed(2);
  return `${symbol}${amount}`;
}

/**
 * Generate a PDF for email attachment. Returns the PDF as a Buffer.
 */
export function generateEmailPDF(
  data: EmailPDFData,
  config: CountryEmailConfig,
): Buffer {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;

  // Background
  pdf.setFillColor(...C.white);
  pdf.rect(0, 0, W, H, 'F');

  // Header bar
  pdf.setFillColor(6, 7, 9);
  pdf.rect(0, 0, W, 22, 'F');
  pdf.setTextColor(222, 189, 104);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(config.company.toUpperCase(), M, 10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(config.pdfTitle, M, 16);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, W - M, 10, {
    align: 'right',
  });

  let y = 32;

  // Title
  pdf.setTextColor(...C.black);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, M, y);
  y += 8;

  // Invoice / quote number
  if (data.invoiceNumber) {
    pdf.setTextColor(...C.muted);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice: ${data.invoiceNumber}`, M, y);
    y += 6;
  }

  // Customer info
  if (data.customerName || data.customerEmail) {
    pdf.setTextColor(...C.muted);
    pdf.setFontSize(9);
    if (data.customerName) {
      pdf.text(`Customer: ${data.customerName}`, M, y);
      y += 5;
    }
    if (data.customerEmail) {
      pdf.text(`Email: ${data.customerEmail}`, M, y);
      y += 5;
    }
    if (data.customerAddress) {
      pdf.text(`Address: ${data.customerAddress}`, M, y);
      y += 5;
    }
    y += 3;
  }

  // Divider
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(M, y, W - M, y);
  y += 6;

  // Screenshot (data URI only — no browser Image() needed)
  if (data.screenshotDataUri) {
    try {
      const format = data.screenshotDataUri.includes('image/png')
        ? 'PNG'
        : 'JPEG';
      const maxImgW = CW;
      const maxImgH = 80;
      let imgW = maxImgW;
      let imgH = (imgW * 3) / 4;
      if (imgH > maxImgH) {
        imgH = maxImgH;
        imgW = (imgH * 4) / 3;
      }
      const imgX = M + (CW - imgW) / 2;
      pdf.addImage(data.screenshotDataUri, format, imgX, y, imgW, imgH);
      y += imgH + 6;
    } catch {
      // Skip image on error
    }
  }

  // Design name
  pdf.setTextColor(...C.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Design: ${data.designName}`, M, y);
  y += 8;

  // Quote table
  if (data.quoteItems.length > 0) {
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(M, y - 2, CW, 8, 'F');
    pdf.setTextColor(...C.muted);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ITEM', M + 4, y + 3);
    pdf.text('QTY', M + CW * 0.65, y + 3);
    pdf.text('PRICE', M + CW - 4, y + 3, { align: 'right' });
    y += 10;

    // Rows
    for (const item of data.quoteItems) {
      if (y > H - 40) {
        pdf.addPage();
        y = 20;
      }
      pdf.setTextColor(...C.text);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(item.description, CW * 0.6);
      pdf.text(descLines[0], M + 4, y);
      pdf.text(String(item.quantity ?? 1), M + CW * 0.65, y);
      pdf.text(
        formatCurrency(item.totalCents, config.currencySymbol),
        M + CW - 4,
        y,
        { align: 'right' },
      );
      pdf.setDrawColor(...C.border);
      pdf.setLineWidth(0.1);
      y += 3;
      pdf.line(M, y, W - M, y);
      y += 5;
    }

    // Subtotal / Tax / Total
    y += 2;
    if (data.subtotalCents != null) {
      pdf.setTextColor(...C.muted);
      pdf.setFontSize(9);
      pdf.text('Subtotal:', M + CW * 0.65, y);
      pdf.text(
        formatCurrency(data.subtotalCents, config.currencySymbol),
        M + CW - 4,
        y,
        { align: 'right' },
      );
      y += 6;
    }
    if (data.taxCents != null && data.taxCents > 0) {
      pdf.text('Tax:', M + CW * 0.65, y);
      pdf.text(
        formatCurrency(data.taxCents, config.currencySymbol),
        M + CW - 4,
        y,
        { align: 'right' },
      );
      y += 6;
    }

    // Total
    pdf.setDrawColor(...C.black);
    pdf.setLineWidth(0.5);
    pdf.line(M + CW * 0.6, y - 2, W - M, y - 2);
    pdf.setTextColor(...C.black);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', M + CW * 0.6, y + 4);
    pdf.text(
      formatCurrency(data.totalCents, config.currencySymbol),
      M + CW - 4,
      y + 4,
      { align: 'right' },
    );
    y += 14;
  }

  // Payment info
  if (config.pdfPayment) {
    if (y > H - 60) {
      pdf.addPage();
      y = 20;
    }
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.3);
    pdf.line(M, y, W - M, y);
    y += 8;

    pdf.setTextColor(...C.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(config.pdfPayment, M, y);
    y += 6;

    pdf.setTextColor(...C.muted);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(config.pdfReference, M, y);
    y += 5;
    pdf.text(config.pdfCallUsCreditCard, M, y);
    y += 5;
    pdf.text(config.accountInfo, M, y);
    y += 10;
  }

  // Sidenote
  if (config.pdfSidenote) {
    pdf.setFillColor(255, 248, 225);
    const noteLines = pdf.splitTextToSize(config.pdfSidenote, CW - 12);
    const noteH = noteLines.length * 4 + 8;
    pdf.rect(M, y, CW, noteH, 'F');
    pdf.setTextColor(...C.text);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(noteLines, M + 6, y + 5);
    y += noteH + 6;
  }

  // Footer
  const footerY = H - 12;
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `${config.company} | ${config.pdfContact} | ${config.email}`,
    W / 2,
    footerY,
    { align: 'center' },
  );
  pdf.text(
    `${config.pdfCopyAddress}, ${config.pdfCopyAddress2}, ${config.pdfCopyAddress3}`,
    W / 2,
    footerY + 4,
    { align: 'center' },
  );

  // Return as Buffer
  const arrayBuffer = pdf.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
