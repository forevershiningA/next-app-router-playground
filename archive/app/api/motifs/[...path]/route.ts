import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: categoryPathArray } = await params;
    const categoryPath = categoryPathArray.join('/');
    
    // Motif files are organized in category subdirectories under public/motifs/
    const categoryDir = path.join(process.cwd(), 'public', 'motifs', categoryPath);
    const filesListPath = path.join(categoryDir, 'files.txt');
    
    // Check if category directory and files.txt exist
    if (!fs.existsSync(categoryDir) || !fs.existsSync(filesListPath)) {
      console.log(`Category not found: ${categoryPath}`);
      return NextResponse.json({ motifs: [] });
    }
    
    // Read the files.txt which contains comma-separated list of filenames (without .svg extension)
    const filesContent = fs.readFileSync(filesListPath, 'utf-8');
    const fileNames = filesContent
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    // Map to motif objects - files are in public/shapes/motifs/ with .svg extension
    const motifs = fileNames.map(fileName => ({
      path: `/shapes/motifs/${fileName}.svg`,
      name: fileName
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      category: categoryPath
    }));
    
    return NextResponse.json({ motifs });
  } catch (error) {
    console.error('Error reading motifs:', error);
    return NextResponse.json({ motifs: [] }, { status: 500 });
  }
}
