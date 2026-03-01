import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface DesignFiles {
  screenshot: string;
  thumbnail: string;
  json: string;
  xml: string;
  html: string;
  p3d: string;
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function saveDesignFiles(
  designId: string,
  screenshot: Buffer,
  jsonData: object,
  xmlData: string,
  htmlData: string,
  p3dData: Buffer
): Promise<DesignFiles> {
  const basePath = path.join(process.cwd(), 'public', 'saved-designs');
  
  // Get current year and month
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const datePath = path.join(year, month);
  
  // Create subdirectories with year/month structure
  const screenshotsPath = path.join(basePath, 'screenshots', datePath);
  const thumbnailsPath = path.join(basePath, 'thumbnails', datePath);
  const jsonPath = path.join(basePath, 'json', datePath);
  const xmlPath = path.join(basePath, 'xml', datePath);
  const htmlPath = path.join(basePath, 'html', datePath);
  const p3dPath = path.join(basePath, 'p3d', datePath);

  await Promise.all([
    ensureDirectoryExists(screenshotsPath),
    ensureDirectoryExists(thumbnailsPath),
    ensureDirectoryExists(jsonPath),
    ensureDirectoryExists(xmlPath),
    ensureDirectoryExists(htmlPath),
    ensureDirectoryExists(p3dPath),
  ]);

  // Generate filenames
  const screenshotFile = `design_${designId}.png`;
  const thumbnailFile = `design_${designId}_thumb.png`;
  const jsonFile = `design_${designId}.json`;
  const xmlFile = `design_${designId}.xml`;
  const htmlFile = `design_${designId}.html`;
  const p3dFile = `design_${designId}.p3d`;

  // Generate thumbnail (300x200 max, maintain aspect ratio)
  let thumbnail: Buffer;
  try {
    thumbnail = await sharp(screenshot)
      .resize(300, 200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Failed to generate thumbnail, using original:', error);
    thumbnail = screenshot;
  }

  // Save files
  await Promise.all([
    writeFile(path.join(screenshotsPath, screenshotFile), screenshot),
    writeFile(path.join(thumbnailsPath, thumbnailFile), thumbnail),
    writeFile(path.join(jsonPath, jsonFile), JSON.stringify(jsonData, null, 2)),
    writeFile(path.join(xmlPath, xmlFile), xmlData),
    writeFile(path.join(htmlPath, htmlFile), htmlData),
    writeFile(path.join(p3dPath, p3dFile), p3dData),
  ]);

  return {
    screenshot: `/saved-designs/screenshots/${datePath}/${screenshotFile}`,
    thumbnail: `/saved-designs/thumbnails/${datePath}/${thumbnailFile}`,
    json: `/saved-designs/json/${datePath}/${jsonFile}`,
    xml: `/saved-designs/xml/${datePath}/${xmlFile}`,
    html: `/saved-designs/html/${datePath}/${htmlFile}`,
    p3d: `/saved-designs/p3d/${datePath}/${p3dFile}`,
  };
}

export function designToXML(design: any): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<design>\n';
  xml += `  <id>${design.id}</id>\n`;
  xml += `  <name>${escapeXML(design.name)}</name>\n`;
  xml += `  <productId>${design.productId}</productId>\n`;
  xml += `  <price>${design.price || 0}</price>\n`;
  xml += `  <quote>${escapeXML(design.quote || '')}</quote>\n`;
  xml += `  <createdAt>${design.createdAt}</createdAt>\n`;
  
  if (design.screenshot) {
    xml += `  <screenshot>${escapeXML(design.screenshot)}</screenshot>\n`;
  }
  
  if (design.thumbnail) {
    xml += `  <thumbnail>${escapeXML(design.thumbnail)}</thumbnail>\n`;
  }
  
  if (design.data) {
    xml += '  <data>\n';
    xml += `    <json><![CDATA[${JSON.stringify(design.data)}]]></json>\n`;
    xml += '  </data>\n';
  }
  
  xml += '</design>\n';
  return xml;
}

export function designToP3D(design: any): Buffer {
  // P3D is a binary format - create a simple binary representation
  const data = {
    version: 1,
    design: design
  };
  
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString, 'utf-8');
}

export function generatePriceQuoteHTML(design: any): string {
  const totalPrice = design.price || 0;
  const designData = design.data || {};
  
  // Extract product information
  const productId = designData.productId || 'Unknown';
  const productName = design.name || 'Custom Design';
  const widthMm = designData.widthMm || 0;
  const heightMm = designData.heightMm || 0;
  const materialUrl = designData.materialUrl || designData.headstoneMaterialUrl || '';
  const shapeUrl = designData.shapeUrl || '';
  
  // Extract material and shape names from URLs
  const materialMatch = materialUrl.match(/\/([^\/]+)\.(webp|jpg|png)$/);
  const materialName = materialMatch ? materialMatch[1].replace(/-/g, ' ') : 'Unknown Material';
  const shapeMatch = shapeUrl.match(/\/([^\/]+)\.svg$/);
  const shapeName = shapeMatch ? shapeMatch[1].replace(/_/g, ' ').replace(/-/g, ' ') : 'Unknown Shape';
  
  // Convert mm to inches
  const widthInches = (widthMm / 25.4).toFixed(0);
  const heightInches = (heightMm / 25.4).toFixed(0);
  
  // Get inscriptions, motifs, and images
  const inscriptions = designData.inscriptions || [];
  const motifs = designData.selectedMotifs || [];
  const images = designData.selectedImages || [];
  
  // Build table rows
  let tableRows = '';
  
  // Main product row
  tableRows += `
    <tr>
      <td>
        <span class="table-header-for-mobile">Product</span>
        <p>
          <strong>Product ID: ${escapeHTML(productId)} - ${escapeHTML(productName)}</strong><br>
          Shape: ${escapeHTML(shapeName)}<br>
          Material: ${escapeHTML(materialName)}<br>
          Size: ${widthInches}″ x ${heightInches}″
        </p>
      </td>
      <td><span class="table-header-for-mobile">Qty</span>1</td>
      <td><span class="table-header-for-mobile">Price</span>$${totalPrice.toFixed(2)}</td>
      <td><span class="table-header-for-mobile">Item Total</span>$${totalPrice.toFixed(2)}</td>
    </tr>
  `;
  
  // Add motifs
  motifs.forEach((motif: any) => {
    const motifPath = motif.svgPath || '';
    const motifMatch = motifPath.match(/\/([^\/]+)\.svg$/);
    const motifFile = motifMatch ? motifMatch[1] : 'Unknown';
    const motifColor = motif.color || '#ffffff';
    
    tableRows += `
      <tr>
        <td>
          <span class="table-header-for-mobile">Product</span>
          <p>
            <strong>Motif (included)</strong><br>
            File: ${escapeHTML(motifFile)}<br>
            Color: ${escapeHTML(motifColor)}
          </p>
        </td>
        <td><span class="table-header-for-mobile">Qty</span>1</td>
        <td><span class="table-header-for-mobile">Price</span>$0.00</td>
        <td><span class="table-header-for-mobile">Item Total</span>$0.00</td>
      </tr>
    `;
  });
  
  // Add images
  images.forEach((image: any) => {
    const imageType = image.typeName || 'Photo';
    const imageWidth = image.widthMm || 0;
    const imageHeight = image.heightMm || 0;
    const imageWidthInches = (imageWidth / 25.4).toFixed(1);
    const imageHeightInches = (imageHeight / 25.4).toFixed(1);
    
    tableRows += `
      <tr>
        <td>
          <span class="table-header-for-mobile">Product</span>
          <p>
            <strong>${escapeHTML(imageType)}</strong><br>
            Size: ${imageWidthInches}″ x ${imageHeightInches}″
          </p>
        </td>
        <td><span class="table-header-for-mobile">Qty</span>1</td>
        <td><span class="table-header-for-mobile">Price</span>$0.00</td>
        <td><span class="table-header-for-mobile">Item Total</span>$0.00</td>
      </tr>
    `;
  });
  
  // Add inscriptions
  inscriptions.forEach((inscription: any) => {
    const text = inscription.text || '';
    const font = inscription.font || 'Default';
    const sizeMm = inscription.sizeMm || 0;
    const sizeInches = (sizeMm / 25.4).toFixed(1);
    const color = inscription.color || '#ffffff';
    
    if (text) {
      tableRows += `
        <tr>
          <td>
            <span class="table-header-for-mobile">Product</span>
            <p>
              <strong>Inscription (included)</strong><br>
              ${escapeHTML(text)}<br>
              ${sizeInches}″ ${escapeHTML(font)}, color: ${escapeHTML(color)}
            </p>
          </td>
          <td><span class="table-header-for-mobile">Qty</span>${text.length}</td>
          <td><span class="table-header-for-mobile">Price</span>$0.00</td>
          <td><span class="table-header-for-mobile">Item Total</span>$0.00</td>
        </tr>
      `;
    }
  });
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Quote - ${escapeHTML(design.name)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(to bottom right, #1a1410, #0f0a07);
      min-height: 100vh;
      padding: 40px 20px;
      color: white;
    }
    .quote-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 25px 65px rgba(0, 0, 0, 0.6);
    }
    h1 {
      color: white;
      margin-bottom: 10px;
      font-size: 32px;
    }
    .quote-date {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin-bottom: 30px;
    }
    .mdc-data-table__content {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .mdc-data-table__content th {
      background: rgba(255, 255, 255, 0.1);
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      color: white;
    }
    .mdc-data-table__content td {
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      vertical-align: top;
      color: rgba(255, 255, 255, 0.9);
    }
    .mdc-data-table__content tr:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .mdc-data-table__content p {
      margin: 0;
      line-height: 1.6;
    }
    .mdc-data-table__content strong {
      color: white;
      font-weight: bold;
    }
    .table-header-for-mobile {
      display: none;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.7);
    }
    .total-flex {
      font-weight: bold;
      background: rgba(255, 255, 255, 0.05);
      border-top: 2px solid rgba(212, 168, 79, 0.5);
    }
    .total-flex td {
      color: #D4A84F;
      font-size: 18px;
    }
    .total-title {
      text-align: right;
      font-size: 18px;
    }
    .empty-cell {
      border: none;
    }
    @media (max-width: 768px) {
      .mdc-data-table__content thead {
        display: none;
      }
      .mdc-data-table__content tr {
        display: block;
        margin-bottom: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        overflow: hidden;
      }
      .mdc-data-table__content td {
        display: block;
        text-align: right;
        border: none;
        padding: 8px 12px;
      }
      .table-header-for-mobile {
        display: inline;
        float: left;
      }
    }
  </style>
</head>
<body>
  <div class="quote-container">
    <table class="mdc-data-table__content">
      <thead>
        <tr>
          <th width="55%">Product</th>
          <th width="15%">Qty</th>
          <th width="15%">Price</th>
          <th width="15%">Item Total</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-flex">
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
          <td class="total-title">Total</td>
          <td>$${totalPrice.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="display:block; color: rgba(255, 255, 255, 0.6);">Price is in US dollars. Shipping inclusive</td>
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

function escapeXML(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHTML(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
