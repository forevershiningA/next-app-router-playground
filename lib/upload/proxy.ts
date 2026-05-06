import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

export type UploadSubdir = 'backgrounds' | 'images' | 'screenshots' | 'pdfs';

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * In development: save file to public/uploads/{subdir}/ and return a local URL.
 * No remote server needed — files are served by Next.js as static assets.
 */
async function saveLocally(file: File, subdir: UploadSubdir): Promise<NextResponse> {
  const bytes = await file.arrayBuffer();
  const ext = EXT_MAP[file.type] ?? 'bin';
  const filename = randomBytes(16).toString('hex') + '.' + ext;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir);

  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${subdir}/${filename}` });
}

/**
 * In production: forward the file to upload.php on wiecznapamiec.pl.
 * Keeps UPLOAD_REMOTE_SECRET out of the browser.
 *
 * Required env vars:
 *   UPLOAD_REMOTE_URL    — https://www.wiecznapamiec.pl/forevershining/upload.php
 *   UPLOAD_REMOTE_SECRET — shared secret matching upload.php $secret
 */
async function saveRemotely(file: File, subdir: UploadSubdir): Promise<NextResponse> {
  const uploadUrl = process.env.UPLOAD_REMOTE_URL;
  const uploadSecret = process.env.UPLOAD_REMOTE_SECRET;

  if (!uploadUrl || !uploadSecret) {
    return NextResponse.json(
      { error: 'Upload server not configured (missing UPLOAD_REMOTE_URL or UPLOAD_REMOTE_SECRET)' },
      { status: 500 },
    );
  }

  const outForm = new FormData();
  outForm.append('file', file);
  outForm.append('subdir', subdir);

  let phpResponse: Response;
  try {
    phpResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${uploadSecret}` },
      body: outForm,
    });
  } catch (err) {
    console.error(`[upload/${subdir}] Fetch to remote failed:`, err);
    return NextResponse.json({ error: 'Could not reach upload server' }, { status: 502 });
  }

  if (!phpResponse.ok) {
    const text = await phpResponse.text().catch(() => '');
    console.error(`[upload/${subdir}] Remote error:`, phpResponse.status, text);
    return NextResponse.json({ error: 'Upload server returned an error' }, { status: 502 });
  }

  const result = await phpResponse.json();
  return NextResponse.json(result);
}

/**
 * Forwards a file to the correct storage backend based on environment.
 * Development → local public/uploads/   Production → wiecznapamiec.pl
 */
export async function proxyUpload(file: File, subdir: UploadSubdir): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'development') {
    return saveLocally(file, subdir);
  }
  return saveRemotely(file, subdir);
}

/** Parse multipart form data and extract the 'file' field. */
export async function extractFile(
  request: Request,
): Promise<{ file: File } | NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  return { file };
}
