import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_CROP_DIMENSION = 5000;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const x = parseInt(formData.get('x') as string);
    const y = parseInt(formData.get('y') as string);
    const width = parseInt(formData.get('width') as string);
    const height = parseInt(formData.get('height') as string);
    const originalPath = formData.get('originalPath') as string;

    if (!file || isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 8 MB.' }, { status: 413 });
    }

    if (
      x < 0 ||
      y < 0 ||
      width <= 0 ||
      height <= 0 ||
      width > MAX_CROP_DIMENSION ||
      height > MAX_CROP_DIMENSION
    ) {
      return NextResponse.json({ error: 'Invalid crop dimensions' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height || x + width > metadata.width || y + height > metadata.height) {
      return NextResponse.json({ error: 'Crop area is outside the image' }, { status: 400 });
    }

    // Crop the image
    const croppedBuffer = await sharp(buffer, { limitInputPixels: 50_000_000 })
      .extract({ left: x, top: y, width, height })
      .png()
      .toBuffer();

    // Save cropped version in the same directory as original
    const normalizedOriginalPath = originalPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const pathParts = normalizedOriginalPath.split('/').filter(Boolean);
    const filename = pathParts[pathParts.length - 1];

    if (!filename || !filename.endsWith('_masked.png') || pathParts[0] !== 'upload') {
      return NextResponse.json({ error: 'Invalid original image path' }, { status: 400 });
    }

    const baseName = filename.replace('_masked.png', '');
    if (!/^[0-9a-z_.-]+$/i.test(baseName)) {
      return NextResponse.json({ error: 'Invalid original image path' }, { status: 400 });
    }

    const uploadRoot = path.resolve(process.cwd(), 'public', 'upload');
    
    const croppedPath = path.resolve(
      process.cwd(),
      'public',
      ...pathParts.slice(0, -1),
      `${baseName}_cropped.png`
    );

    if (!croppedPath.startsWith(`${uploadRoot}${path.sep}`)) {
      return NextResponse.json({ error: 'Invalid original image path' }, { status: 400 });
    }

    await writeFile(croppedPath, croppedBuffer);

    const relativeCroppedPath = `/${pathParts.slice(0, -1).join('/')}/${baseName}_cropped.png`;

    return NextResponse.json({
      path: relativeCroppedPath,
      result: 1
    });

  } catch (error) {
    console.error('Crop error:', error);
    return NextResponse.json({ result: 0, error: 'Crop failed' }, { status: 500 });
  }
}
