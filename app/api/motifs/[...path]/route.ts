import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { filenameMatchesCategory } from '#/lib/motif-category-mappings';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: categoryPathArray } = await params;
    const categoryPath = categoryPathArray.join('/');
    
    // SVG files are in the root motifs directory
    const motifsDir = path.join(process.cwd(), 'public', 'shapes', 'motifs');
    
    if (!fs.existsSync(motifsDir)) {
      return NextResponse.json({ motifs: [] });
    }
    
    // Read all SVG files from the motifs directory
    const files = fs.readdirSync(motifsDir);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    // Filter files that match the category
    const categoryFiles = svgFiles.filter(file => 
      filenameMatchesCategory(file, categoryPath)
    );
    
    // Map to motif objects
    const motifs = categoryFiles.map(file => ({
      path: `/shapes/motifs/${file}`,
      name: file
        .replace('.svg', '')
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
