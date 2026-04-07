import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const HIDDEN_FILE = path.join(process.cwd(), 'data', 'hidden-designs.json');

function readHiddenIds(): string[] {
  try {
    const raw = fs.readFileSync(HIDDEN_FILE, 'utf-8');
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeHiddenIds(ids: string[]) {
  fs.writeFileSync(HIDDEN_FILE, JSON.stringify(ids, null, 2) + '\n', 'utf-8');
}

export async function GET() {
  return NextResponse.json(readHiddenIds());
}

export async function POST(request: NextRequest) {
  const { id } = (await request.json()) as { id: string };
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }
  const ids = readHiddenIds();
  if (!ids.includes(id)) {
    ids.push(id);
    writeHiddenIds(ids);
  }
  return NextResponse.json({ hidden: ids });
}

export async function DELETE(request: NextRequest) {
  const { id } = (await request.json()) as { id: string };
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }
  const ids = readHiddenIds().filter((x) => x !== id);
  writeHiddenIds(ids);
  return NextResponse.json({ hidden: ids });
}
