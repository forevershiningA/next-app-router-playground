import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const FAV_FILE = path.join(process.cwd(), 'data', 'favorite-designs.json');

function readFavIds(): string[] {
  try {
    const raw = fs.readFileSync(FAV_FILE, 'utf-8');
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeFavIds(ids: string[]) {
  fs.writeFileSync(FAV_FILE, JSON.stringify(ids, null, 2) + '\n', 'utf-8');
}

export async function GET() {
  return NextResponse.json(readFavIds());
}

// Toggle: POST adds if missing, removes if present
export async function POST(request: NextRequest) {
  const { id } = (await request.json()) as { id: string };
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }
  let ids = readFavIds();
  if (ids.includes(id)) {
    ids = ids.filter((x) => x !== id);
  } else {
    ids.push(id);
  }
  writeFavIds(ids);
  return NextResponse.json({ favorites: ids });
}
