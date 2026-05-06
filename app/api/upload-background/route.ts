import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for background image uploads.
 * Forwards the file to the PHP upload endpoint on wiecznapamiec.pl,
 * keeping UPLOAD_REMOTE_SECRET out of the browser.
 *
 * Required env vars:
 *   UPLOAD_REMOTE_URL    — full URL to upload_background.php on the server
 *   UPLOAD_REMOTE_SECRET — shared secret matching the PHP script's $secret
 */
export async function POST(request: NextRequest) {
  const uploadUrl = process.env.UPLOAD_REMOTE_URL;
  const uploadSecret = process.env.UPLOAD_REMOTE_SECRET;

  if (!uploadUrl || !uploadSecret) {
    return NextResponse.json(
      { error: 'Upload server not configured (missing UPLOAD_REMOTE_URL or UPLOAD_REMOTE_SECRET)' },
      { status: 500 },
    );
  }

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

  // Forward the file to the PHP endpoint
  const outForm = new FormData();
  outForm.append('file', file);

  let phpResponse: Response;
  try {
    phpResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${uploadSecret}` },
      body: outForm,
    });
  } catch (err) {
    console.error('[upload-background] Fetch to remote failed:', err);
    return NextResponse.json({ error: 'Could not reach upload server' }, { status: 502 });
  }

  if (!phpResponse.ok) {
    const text = await phpResponse.text().catch(() => '');
    console.error('[upload-background] Remote error:', phpResponse.status, text);
    return NextResponse.json({ error: 'Upload server returned an error' }, { status: 502 });
  }

  const result = await phpResponse.json();
  return NextResponse.json(result);
}
