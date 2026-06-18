import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

export type UploadSubdir = 'backgrounds' | 'images' | 'screenshots' | 'pdfs' | 'designs';

const MAX_BROWSER_UPLOAD_BYTES = 8 * 1024 * 1024;

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/json': 'json',
};

const ALLOWED_TYPES: Record<UploadSubdir, Set<string>> = {
  backgrounds: new Set(['image/jpeg', 'image/png', 'image/webp']),
  images: new Set(['image/jpeg', 'image/png', 'image/webp']),
  screenshots: new Set(['image/jpeg', 'image/png', 'image/webp']),
  pdfs: new Set(['application/pdf']),
  designs: new Set(['application/json']),
};

function validateBrowserUpload(file: File, subdir: UploadSubdir): NextResponse | null {
  if (file.size <= 0) {
    return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
  }

  if (file.size > MAX_BROWSER_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File is too large. Maximum size is 8 MB.' }, { status: 413 });
  }

  if (!ALLOWED_TYPES[subdir].has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
  }

  return null;
}

async function saveLocallyGetUrl(file: File, subdir: UploadSubdir): Promise<string> {
  const bytes = await file.arrayBuffer();
  const ext = EXT_MAP[file.type] ?? 'bin';
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const filename = randomBytes(16).toString('hex') + '.' + ext;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir, year, month);

  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return `/uploads/${subdir}/${year}/${month}/${filename}`;
}

/**
 * In production: forward the file to upload.php on wiecznapamiec.pl.
 * Keeps UPLOAD_REMOTE_SECRET out of the browser.
 *
 * Required env vars:
 *   UPLOAD_REMOTE_URL    — https://www.wiecznapamiec.pl/forevershining/upload.php
 *   UPLOAD_REMOTE_SECRET — shared secret matching upload.php $secret
 */
async function saveRemotelyGetUrl(file: File, subdir: UploadSubdir): Promise<string> {
  const uploadUrl = process.env.UPLOAD_REMOTE_URL;
  const uploadSecret = process.env.UPLOAD_REMOTE_SECRET;

  if (!uploadUrl || !uploadSecret) {
    throw new Error('Upload server not configured (missing UPLOAD_REMOTE_URL or UPLOAD_REMOTE_SECRET)');
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
    throw new Error(`Could not reach upload server: ${err}`);
  }

  if (!phpResponse.ok) {
    const text = await phpResponse.text().catch(() => '');
    throw new Error(`Upload server returned ${phpResponse.status}: ${text}`);
  }

  const result = await phpResponse.json();
  if (!result.url) throw new Error('Upload server returned no URL');
  return result.url as string;
}

/**
 * Upload a file to storage and return the resulting URL string.
 * Development → local /uploads/{subdir}/   Production → https://www.wiecznapamiec.pl/forevershining/uploads/{subdir}/
 */
export async function uploadToStorage(file: File, subdir: UploadSubdir): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return saveLocallyGetUrl(file, subdir);
  }
  return saveRemotelyGetUrl(file, subdir);
}

/**
 * Forwards a file to the correct storage backend and returns a JSON response.
 * Used by API route handlers that accept multipart uploads from the browser.
 */
export async function proxyUpload(file: File, subdir: UploadSubdir): Promise<NextResponse> {
  const validationError = validateBrowserUpload(file, subdir);
  if (validationError) return validationError;

  try {
    const url = await uploadToStorage(file, subdir);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(`[upload/${subdir}] Upload failed:`, err);
    const isConfig = err instanceof Error && err.message.includes('not configured');
    return NextResponse.json({ error: String(err) }, { status: isConfig ? 500 : 502 });
  }
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
