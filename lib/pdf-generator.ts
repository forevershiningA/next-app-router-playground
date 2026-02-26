import { jsPDF } from 'jspdf';

export type DesignPDFData = {
  title: string;
  screenshot: string;
  priceLabel: string;
  createdLabel: string;
  description: string;
  productName: string;
};

export async function generateDesignPDF(design: DesignPDFData): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  pdf.setFillColor(12, 8, 5);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Memorial Design', margin, 25);

  // Design Title
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(design.title, margin, 55);

  // Product Type
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(design.productName, margin, 63);

  // Design Screenshot
  if (design.screenshot) {
    try {
      // Add image - assumes base64 or URL
      const img = await loadImage(design.screenshot);
      const imgWidth = contentWidth;
      const imgHeight = (imgWidth * 3) / 4; // 4:3 aspect ratio
      
      pdf.addImage(img, 'JPEG', margin, 75, imgWidth, imgHeight);
      
      // Description below image
      let yPos = 75 + imgHeight + 15;
      
      // Description
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description:', margin, yPos);
      
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const descLines = pdf.splitTextToSize(design.description, contentWidth);
      pdf.text(descLines, margin, yPos);
      
      yPos += descLines.length * 5 + 10;
      
      // Pricing Info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Pricing Information', margin, yPos);
      
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Price: ${design.priceLabel}`, margin, yPos);
      
      yPos += 6;
      pdf.text(`Created: ${design.createdLabel}`, margin, yPos);
      
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      // Continue without image
    }
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Forever Shining Memorial Designs', margin, footerY);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF
  pdf.save(`${design.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}

async function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (src.startsWith('data:')) {
      // Already base64
      resolve(src);
    } else {
      // Convert URL to base64
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = src;
    }
  });
}
