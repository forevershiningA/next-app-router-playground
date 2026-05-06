import { NextResponse } from 'next/server';

export type UploadSubdir = 'backgrounds' | 'images' | 'screenshots' | 'pdfs';

/**
 * Forwards a file to the unified upload.php endpoint on wiecznapamiec.pl.
 * All server-side file storage goes through this single function.
 *
 * Required env vars:
 *   UPLOAD_REMOTE_URL    — https://www.wiecznapamiec.pl/upload.php
 *   UPLOAD_REMOTE_SECRET — shared secret matching upload.php $secret
 *
 * Returns a NextResponse with { url: string } on success.
 */
export async function proxyUpload(file: File, subdir: UploadSubdir): Promise<NextResponse> {
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
