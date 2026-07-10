import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { downloadScreenshotBuffer } from '@/lib/s3';
import { computeVisualDiff } from '@/lib/visual-diff';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pageId = parseInt(params.id);
  if (isNaN(pageId)) {
    return NextResponse.json({ error: 'Invalid page ID' }, { status: 400 });
  }

  // Verify ownership
  const page = await query('SELECT id FROM tracked_pages WHERE id = $1 AND user_id = $2', [pageId, user.userId]);
  if (page.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get change ID from query param
  const changeId = parseInt(req.nextUrl.searchParams.get('changeId') || '');
  if (isNaN(changeId)) {
    return NextResponse.json({ error: 'Missing changeId query parameter' }, { status: 400 });
  }

  // Get the change record with screenshot keys
  const changeRes = await query(
    `SELECT c.*,
      old_snap.screenshot_s3_key as old_screenshot_key,
      new_snap.screenshot_s3_key as new_screenshot_key
     FROM changes c
     LEFT JOIN snapshots old_snap ON c.old_snapshot_id = old_snap.id
     JOIN snapshots new_snap ON c.new_snapshot_id = new_snap.id
     WHERE c.id = $1 AND c.tracked_page_id = $2`,
    [changeId, pageId]
  );

  if (changeRes.rows.length === 0) {
    return NextResponse.json({ error: 'Change not found' }, { status: 404 });
  }

  const change = changeRes.rows[0];

  // If no old screenshot, return the new one
  if (!change.old_screenshot_key) {
    if (!change.new_screenshot_key) {
      return NextResponse.json({ error: 'No screenshots available' }, { status: 404 });
    }
    // Redirect to the new screenshot
    return NextResponse.redirect(new URL(`/api/screenshot/${encodeURIComponent(change.new_screenshot_key)}`, req.url));
  }

  if (!change.new_screenshot_key) {
    return NextResponse.json({ error: 'No new screenshot available' }, { status: 404 });
  }

  try {
    const oldBuf = await downloadScreenshotBuffer(change.old_screenshot_key);
    const newBuf = await downloadScreenshotBuffer(change.new_screenshot_key);

    const result = computeVisualDiff(oldBuf, newBuf);
    if (!result) {
      return NextResponse.json({ error: 'Failed to compute visual diff' }, { status: 500 });
    }

    const ab = result.diffBuffer.buffer.slice(result.diffBuffer.byteOffset, result.diffBuffer.byteOffset + result.diffBuffer.byteLength) as ArrayBuffer;
    return new NextResponse(new Blob([ab], { type: 'image/png' }), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'X-Diff-Percent': result.diffPercent.toString(),
        'X-Diff-Pixels': result.diffPixels.toString(),
      },
    });
  } catch (err) {
    console.error('[VisualDiff API] Error:', err);
    return NextResponse.json({ error: 'Failed to process visual diff' }, { status: 500 });
  }
}
