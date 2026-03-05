import { jsPDF } from 'jspdf';

export type DesignPDFData = {
  title: string;
  screenshot: string;
  priceLabel: string;
  createdLabel: string;
  description: string;
  productName: string;
};

// Colours
const C = {
  bg:         [12, 8, 5]      as [number,number,number],
  card:       [20, 14, 8]     as [number,number,number],
  border:     [45, 35, 20]    as [number,number,number],
  gold:       [212, 168, 79]  as [number,number,number],
  white:      [255, 255, 255] as [number,number,number],
  dim:        [160, 140, 110] as [number,number,number],
  muted:      [100, 88, 68]   as [number,number,number],
  footer:     [80, 70, 55]    as [number,number,number],
};

export async function generateDesignPDF(design: DesignPDFData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();   // 210
  const H = pdf.internal.pageSize.getHeight();  // 297
  const M = 18; // margin
  const CW = W - M * 2; // content width

  // ── Full-page dark background ──────────────────────────────────────────────
  pdf.setFillColor(...C.bg);
  pdf.rect(0, 0, W, H, 'F');

  // ── Header bar ─────────────────────────────────────────────────────────────
  pdf.setFillColor(...C.card);
  pdf.rect(0, 0, W, 22, 'F');

  pdf.setTextColor(...C.gold);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FOREVER SHINING', M, 9);

  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Memorial Design Quote', M, 15);

  // Generated date — top right
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-AU')}`, W - M, 14, { align: 'right' });

  // ── Title row (title left, price right) ────────────────────────────────────
  let y = 34;

  pdf.setTextColor(...C.white);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.title, M, y);

  // Price — right-aligned, gold
  pdf.setTextColor(...C.gold);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.priceLabel, W - M, y, { align: 'right' });

  y += 6;

  // Product name + created date on same line
  pdf.setTextColor(...C.dim);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(design.productName, M, y);
  pdf.text(`Created ${design.createdLabel}`, W - M, y, { align: 'right' });

  y += 10;

  // ── Thin gold divider ──────────────────────────────────────────────────────
  pdf.setDrawColor(...C.gold);
  pdf.setLineWidth(0.3);
  pdf.line(M, y, W - M, y);

  y += 8;

  // ── Design image ──────────────────────────────────────────────────────────
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

      // Card behind image
      pdf.setFillColor(...C.card);
      pdf.roundedRect(M, y - 2, CW, imgH + 4, 3, 3, 'F');

      pdf.addImage(imgData, 'JPEG', imgX, y, imgW, imgH);
      y += imgH + 8;
    } catch (err) {
      console.error('PDF image error:', err);
    }
  }

  // ── Description card ──────────────────────────────────────────────────────
  const descLines = pdf.splitTextToSize(design.description || 'Custom memorial design', CW - 12);
  const descH = descLines.length * 5 + 12;

  pdf.setFillColor(...C.card);
  pdf.roundedRect(M, y, CW, descH, 3, 3, 'F');

  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DESCRIPTION', M + 6, y + 6);

  pdf.setTextColor(...C.dim);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(descLines, M + 6, y + 12);

  y += descH + 6;

  // ── Price / details row ────────────────────────────────────────────────────
  const rowH = 20;
  const halfW = (CW - 4) / 2;

  // Price cell
  pdf.setFillColor(...C.card);
  pdf.roundedRect(M, y, halfW, rowH, 3, 3, 'F');
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRICE', M + 6, y + 7);
  pdf.setTextColor(...C.gold);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.priceLabel, M + 6, y + 15);

  // Created cell
  const cx = M + halfW + 4;
  pdf.setFillColor(...C.card);
  pdf.roundedRect(cx, y, halfW, rowH, 3, 3, 'F');
  pdf.setTextColor(...C.muted);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CREATED', cx + 6, y + 7);
  pdf.setTextColor(...C.dim);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(design.createdLabel, cx + 6, y + 15);

  // ── Footer ─────────────────────────────────────────────────────────────────
  pdf.setFillColor(...C.card);
  pdf.rect(0, H - 12, W, 12, 'F');

  pdf.setTextColor(...C.footer);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Forever Shining Memorial Designs  ·  forevershining.com.au', M, H - 4);
  pdf.text('This quote is not a final invoice. Prices subject to confirmation.', W - M, H - 4, { align: 'right' });

  pdf.save(`${design.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

async function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (src.startsWith('data:')) { resolve(src); return; }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/jpeg', 0.9)); }
      else reject(new Error('Canvas context failed'));
    };
    img.onerror = reject;
    img.src = src;
  });
}

