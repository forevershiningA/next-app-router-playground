import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crop the image
    const croppedBuffer = await sharp(buffer)
      .extract({ left: x, top: y, width, height })
      .png()
      .toBuffer();

    // Save cropped version in the same directory as original
    const pathParts = originalPath.split('/');
    const filename = pathParts[pathParts.length - 1];
    const baseName = filename.replace('_masked.png', '');
    
    const croppedPath = path.join(
      process.cwd(),
      'public',
      ...pathParts.slice(0, -1),
      `${baseName}_cropped.png`
    );

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
