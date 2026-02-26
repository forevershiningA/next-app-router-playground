import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface DesignFiles {
  screenshot: string;
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
  const jsonPath = path.join(basePath, 'json', datePath);
  const xmlPath = path.join(basePath, 'xml', datePath);
  const htmlPath = path.join(basePath, 'html', datePath);
  const p3dPath = path.join(basePath, 'p3d', datePath);

  await Promise.all([
    ensureDirectoryExists(screenshotsPath),
    ensureDirectoryExists(jsonPath),
    ensureDirectoryExists(xmlPath),
    ensureDirectoryExists(htmlPath),
    ensureDirectoryExists(p3dPath),
  ]);

  // Generate filenames
  const screenshotFile = `design_${designId}.png`;
  const jsonFile = `design_${designId}.json`;
  const xmlFile = `design_${designId}.xml`;
  const htmlFile = `design_${designId}.html`;
  const p3dFile = `design_${designId}.p3d`;

  // Save files
  await Promise.all([
    writeFile(path.join(screenshotsPath, screenshotFile), screenshot),
    writeFile(path.join(jsonPath, jsonFile), JSON.stringify(jsonData, null, 2)),
    writeFile(path.join(xmlPath, xmlFile), xmlData),
    writeFile(path.join(htmlPath, htmlFile), htmlData),
    writeFile(path.join(p3dPath, p3dFile), p3dData),
  ]);

  return {
    screenshot: `/saved-designs/screenshots/${datePath}/${screenshotFile}`,
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
  xml += `  <quote>${design.quote || ''}</quote>\n`;
  xml += `  <createdAt>${design.createdAt}</createdAt>\n`;
  
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
  const price = design.price || 0;
  const quote = design.quote || 'No quote available';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Quote - ${escapeHTML(design.name)}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .quote-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
    }
    .design-info {
      margin-bottom: 30px;
    }
    .design-info label {
      font-weight: bold;
      color: #666;
      display: block;
      margin-bottom: 5px;
    }
    .design-info p {
      margin: 0 0 20px 0;
      color: #333;
    }
    .price {
      font-size: 32px;
      color: #D4A84F;
      font-weight: bold;
    }
    .screenshot {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="quote-container">
    <h1>Design Quote</h1>
    <img src="${design.screenshot}" alt="Design Screenshot" class="screenshot" />
    <div class="design-info">
      <label>Design Name:</label>
      <p>${escapeHTML(design.name)}</p>
      
      <label>Price:</label>
      <p class="price">$${price.toFixed(2)}</p>
      
      <label>Quote:</label>
      <p>${escapeHTML(quote)}</p>
      
      <label>Created:</label>
      <p>${new Date(design.createdAt).toLocaleString()}</p>
    </div>
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
