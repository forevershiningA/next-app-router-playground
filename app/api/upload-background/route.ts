import { NextRequest } from 'next/server';
import { extractFile, proxyUpload } from '#/lib/upload/proxy';

/** Proxies background image uploads to uploads/backgrounds/ on wiecznapamiec.pl. */
export async function POST(request: NextRequest) {
  const result = await extractFile(request);
  if (!('file' in result)) return result;
  return proxyUpload(result.file, 'backgrounds');
}
