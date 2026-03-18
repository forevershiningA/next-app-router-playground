import { jsPDF } from 'jspdf';
import type { PDFQuote } from '#/lib/design-quote';

export type DesignPDFData = {
  title: string;
  screenshot: string;
  priceLabel: string;
  createdLabel: string;
  description: string;
  productName: string;
  quote?: PDFQuote;
};

// Print-friendly colours
const C = {
  white:      [255, 255, 255] as [number, number, number],
  black:      [20, 20, 20]    as [number, number, number],
  text:       [35, 35, 35]    as [number, number, number],
  muted:      [90, 90, 90]    as [number, number, number],
  border:     [190, 190, 190] as [number, number, number],
  accent:     [70, 70, 70]    as [number, number, number],
};

export async function generateDesignPDF(design: DesignPDFData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();   // 210
  const H = pdf.internal.pageSize.getHeight();  // 297
  const M = 18; // margin
  const CW = W - M * 2; // content width

  // White page background for print readability
  pdf.setFillColor(...C.white);
  pdf.rect(0, 0, W, H, 'F');

  // Header
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(M, 18, W - M, 18);

  pdf.setTextColor(...C.black);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FOREVER SHINING', M, 11);

  pdf.setTextColor(...C.muted);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Memorial Design Quote', M, 16);

  // Generated date - top right
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(8);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, W - M, 14, { align: 'right' });

  // Title row
  let y = 30;

  pdf.setTextColor(...C.black);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.title, M, y);

  // Price - right aligned
  pdf.setTextColor(...C.black);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.priceLabel, W - M, y, { align: 'right' });

  y += 6;

  // Product name + created date
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(design.productName, M, y);
  pdf.text(`Created ${design.createdLabel}`, W - M, y, { align: 'right' });

  y += 10;

  // Divider
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(M, y, W - M, y);

  y += 8;

  // Design image
  if (design.screenshot) {
    try {
      const imgData = await loadImage(design.screenshot);
      const maxImgW = CW;
      const maxImgH = 90;
      // Keep 4:3 ratio, constrain to max
      let imgW = maxImgW;
      let imgH = (imgW * 3) / 4;
      if (imgH > maxImgH) { imgH = maxImgH; imgW = (imgH * 4) / 3; }
      const imgX = M + (CW - imgW) / 2;

      pdf.setDrawColor(...C.border);
      pdf.setLineWidth(0.4);
      pdf.rect(M, y - 2, CW, imgH + 4, 'S');
      pdf.addImage(imgData.data, imgData.format, imgX, y, imgW, imgH);
      y += imgH + 8;
    } catch (err) {
      console.error('PDF image error:', err);
    }
  }

  // Description block
  const descLines = pdf.splitTextToSize(design.description || 'Custom memorial design', CW - 12);
  const descH = descLines.length * 5 + 12;

  pdf.setDrawColor(...C.border);
  pdf.rect(M, y, CW, descH, 'S');

  pdf.setTextColor(...C.accent);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESCRIPTION', M + 6, y + 6);

  pdf.setTextColor(...C.text);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(descLines, M + 6, y + 12);

  y += descH + 6;
  if (design.quote) {
    y = await drawQuoteTable(pdf, {
      x: M,
      y,
      width: CW,
      pageHeight: H,
      margin: M,
      quote: design.quote,
    });
  } else {
    // Fallback details row
    const rowH = 20;
    const halfW = (CW - 4) / 2;
    pdf.setDrawColor(...C.border);
    pdf.rect(M, y, halfW, rowH, 'S');
    pdf.setTextColor(...C.accent);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRICE', M + 6, y + 7);
    pdf.setTextColor(...C.black);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(design.priceLabel, M + 6, y + 15);

    const cx = M + halfW + 4;
    pdf.setDrawColor(...C.border);
    pdf.rect(cx, y, halfW, rowH, 'S');
    pdf.setTextColor(...C.accent);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CREATED', cx + 6, y + 7);
    pdf.setTextColor(...C.text);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(design.createdLabel, cx + 6, y + 15);
  }

  // Footer
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(M, H - 12, W - M, H - 12);
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Forever Shining Memorial Designs - forevershining.com.au', M, H - 4);
  pdf.text('This quote is not a final invoice. Prices subject to confirmation.', W - M, H - 4, { align: 'right' });

  pdf.save(`${design.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

function formatCurrency(amount: number, currency: string) {
  const normalized = (currency || 'AUD').toUpperCase();
  const supported = new Set(['AUD', 'USD', 'NZD', 'CAD', 'GBP', 'EUR']);
  const safeCurrency = supported.has(normalized) ? normalized : 'AUD';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 2,
  }).format(amount);
}

async function drawQuoteTable(
  pdf: jsPDF,
  options: {
    x: number;
    y: number;
    width: number;
    pageHeight: number;
    margin: number;
    quote: PDFQuote;
  },
) {
  const { x, width, pageHeight, margin, quote } = options;
  let y = options.y;
  const rowH = 8;
  const itemW = width * 0.6;
  const qtyW = width * 0.15;
  const amountW = width - itemW - qtyW;
  const visibleItems = quote.items.filter((item) => item.amount > 0 || item.quantity > 0);
  const tableRows = Math.max(visibleItems.length, 1);
  const estimatedH = 16 + (tableRows + 4) * rowH + (quote.note ? 12 : 0);

  if (y + estimatedH > pageHeight - margin - 14) {
    pdf.addPage();
    y = margin + 6;
  }

  pdf.setTextColor(...C.black);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('QUOTE BREAKDOWN', x, y);
  y += 5;

  pdf.setDrawColor(...C.border);
  pdf.rect(x, y, width, rowH, 'S');
  pdf.setTextColor(...C.accent);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Item', x + 3, y + 5.5);
  pdf.text('Qty', x + itemW + 3, y + 5.5);
  pdf.text('Amount', x + width - 3, y + 5.5, { align: 'right' });

  y += rowH;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...C.text);

  const rows = visibleItems.length > 0 ? visibleItems : [{ label: 'Design total', quantity: 1, amount: quote.total }];
  for (const row of rows) {
    pdf.rect(x, y, width, rowH, 'S');
    pdf.text(row.label, x + 3, y + 5.5);
    pdf.text(String(row.quantity), x + itemW + 3, y + 5.5);
    pdf.text(formatCurrency(row.amount, quote.currency), x + width - 3, y + 5.5, { align: 'right' });
    y += rowH;
  }

  const totals = [
    ['Subtotal', quote.subtotal],
    ['GST (10%)', quote.tax],
    ['Total', quote.total],
  ] as const;
  for (const [label, value] of totals) {
    pdf.rect(x, y, width, rowH, 'S');
    pdf.setFont('helvetica', label === 'Total' ? 'bold' : 'normal');
    pdf.text(label, x + itemW + 3, y + 5.5);
    pdf.text(formatCurrency(value, quote.currency), x + width - 3, y + 5.5, { align: 'right' });
    y += rowH;
  }

  if (quote.additions.length > 0) {
    y += 4;
    y = await drawDetailSection(pdf, {
      title: 'Additions',
      rows: quote.additions.map((entry) => ({
        key: entry.id,
        title: entry.name,
        subtitle: `Product ID: ${entry.productId} · Type: ${entry.type} · Size Variant: ${entry.variant}`,
        amount: entry.amount,
        thumbnail: entry.thumbnail,
      })),
      x,
      y,
      width,
      pageHeight,
      margin,
      currency: quote.currency,
    });
  }

  if (quote.motifs.length > 0) {
    y += 4;
    y = await drawDetailSection(pdf, {
      title: 'Motifs',
      rows: quote.motifs.map((entry) => ({
        key: entry.id,
        title: entry.name,
        subtitle: `Product ID: ${entry.productId} · Height: ${entry.heightMm}mm · Color: ${entry.colorName}`,
        amount: entry.amount,
        thumbnail: entry.thumbnail,
      })),
      x,
      y,
      width,
      pageHeight,
      margin,
      currency: quote.currency,
    });
  }

  if (quote.inscriptions.length > 0) {
    y += 4;
    y = await drawDetailSection(pdf, {
      title: 'Inscriptions',
      rows: quote.inscriptions.map((entry) => ({
        key: entry.id,
        title: entry.text,
        subtitle: `Line ID: ${entry.id} · Font: ${entry.font} · Size: ${entry.sizeMm}mm · Color: ${entry.colorName}`,
        amount: entry.amount,
      })),
      x,
      y,
      width,
      pageHeight,
      margin,
      currency: quote.currency,
    });
  }

  if (quote.note) {
    y += 4;
    const noteLines = pdf.splitTextToSize(quote.note, width);
    pdf.setTextColor(...C.muted);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(noteLines, x, y);
    y += noteLines.length * 3.5;
  }

  return y;
}

async function drawDetailSection(
  pdf: jsPDF,
  options: {
    title: string;
    rows: Array<{
      key: string;
      title: string;
      subtitle: string;
      amount: number;
      thumbnail?: string;
    }>;
    x: number;
    y: number;
    width: number;
    pageHeight: number;
    margin: number;
    currency: string;
  },
) {
  const { title, rows, x, width, pageHeight, margin, currency } = options;
  let y = options.y;
  const rowH = 12;
  const thumbSize = 9;

  const estimate = 8 + rows.length * rowH;
  if (y + estimate > pageHeight - margin - 14) {
    pdf.addPage();
    y = margin + 6;
  }

  pdf.setTextColor(...C.black);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title.toUpperCase(), x, y);
  y += 3;

  for (const row of rows) {
    if (y + rowH > pageHeight - margin - 14) {
      pdf.addPage();
      y = margin + 6;
    }

    pdf.setDrawColor(...C.border);
    pdf.rect(x, y, width, rowH, 'S');

    let textX = x + 3;
    if (row.thumbnail) {
      try {
        const imageData = await loadImage(row.thumbnail);
        pdf.addImage(imageData.data, imageData.format, x + 1.5, y + 1.5, thumbSize, thumbSize);
      } catch {
        // Keep row render even if thumbnail fails
      }
      textX = x + thumbSize + 3.5;
    }

    pdf.setTextColor(...C.text);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(row.title, width * 0.58);
    pdf.text(titleLines[0] || row.title, textX, y + 4.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...C.muted);
    const subtitleLines = pdf.splitTextToSize(row.subtitle, width * 0.58);
    pdf.text(subtitleLines[0] || row.subtitle, textX, y + 8.5);

    pdf.setTextColor(...C.text);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency(row.amount, currency), x + width - 3, y + 7, { align: 'right' });
    y += rowH;
  }

  return y;
}

async function loadImage(src: string): Promise<{ data: string; format: 'PNG' | 'JPEG' }> {
  return new Promise((resolve, reject) => {
    if (src.startsWith('data:image/png')) {
      resolve({ data: src, format: 'PNG' });
      return;
    }
    if (src.startsWith('data:image/jpeg') || src.startsWith('data:image/jpg')) {
      resolve({ data: src, format: 'JPEG' });
      return;
    }
    const normalizedSrc =
      src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')
        ? src
        : `/${src}`;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // PNG preserves transparency and avoids dark backgrounds around SVG motifs.
        resolve({ data: canvas.toDataURL('image/png'), format: 'PNG' });
      }
      else reject(new Error('Canvas context failed'));
    };
    img.onerror = reject;
    img.src = normalizedSrc;
  });
}

