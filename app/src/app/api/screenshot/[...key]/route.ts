import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { downloadScreenshotBuffer } from '@/lib/s3';

export async function GET(req: NextRequest, { params }: { params: { key: string[] } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const s3Key = params.key.join('/');
  if (!s3Key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    const buffer = await downloadScreenshotBuffer(s3Key);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    return new NextResponse(new Blob([ab], { type: 'image/png' }), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('[Screenshot API] Error:', err);
    return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
  }
}
