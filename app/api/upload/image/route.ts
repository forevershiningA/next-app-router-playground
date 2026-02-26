import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

function replaceAccents(str: string): string {
  const accents: Record<string, string> = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'ą': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ę': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n', 'ç': 'c',
  };
  
  return str.toLowerCase().replace(/[àáâãäąèéêëęìíîïòóôõöùúûüýÿñç]/g, 
    (match) => accents[match] || match);
}

function filenameSafe(filename: string): string {
  let temp = replaceAccents(filename);
  temp = temp.toLowerCase();
  temp = temp.replace(/ /g, '_');
  temp = temp.replace(/[^0-9a-z_\.]/g, '');
  return temp;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('upload') as File;
    const filename = formData.get('filename') as string;
    const grayscale = formData.get('color') === '0';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create safe filename
    let safeName = filenameSafe(filename);
    safeName = safeName.replace(/\.jpg$/i, '').replace(/jpg$/i, '');

    // Create year/month folders
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const uploadPath = path.join(process.cwd(), 'public', 'upload');
    const yearPath = path.join(uploadPath, year);
    const monthPath = path.join(yearPath, month);

    // Create directories if they don't exist
    if (!existsSync(uploadPath)) await mkdir(uploadPath, { recursive: true });
    if (!existsSync(yearPath)) await mkdir(yearPath, { recursive: true });
    if (!existsSync(monthPath)) await mkdir(monthPath, { recursive: true });

    // Save original with mask
    const originalPath = path.join(monthPath, `${safeName}_masked.png`);
    await writeFile(originalPath, buffer);

    // Create thumbnail (100x100 max)
    let thumbnailBuffer = await sharp(buffer)
      .resize(100, 100, { fit: 'inside' })
      .png()
      .toBuffer();

    // Apply grayscale if requested
    if (grayscale) {
      thumbnailBuffer = await sharp(thumbnailBuffer)
        .grayscale()
        .toBuffer();
    }

    const thumbnailPath = path.join(monthPath, `${safeName}_s_masked.png`);
    await writeFile(thumbnailPath, thumbnailBuffer);

    // Create JPG version for admin
    const jpgBuffer = await sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer();
    const jpgPath = path.join(monthPath, `${safeName}_masked.jpg`);
    await writeFile(jpgPath, jpgBuffer);

    const relativePath = `/upload/${year}/${month}/${safeName}_masked.png`;

    return NextResponse.json({
      img: `${safeName}_masked.png`,
      path: relativePath,
      result: 1
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ result: 0, error: 'Upload failed' }, { status: 500 });
  }
}
