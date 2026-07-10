import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { fetchPage, computeDiff, extractVisibleText } from '@/lib/scraper';
import { uploadSnapshot, downloadSnapshot, downloadScreenshotBuffer } from '@/lib/s3';
import { captureScreenshot } from '@/lib/screenshot';
import { computeVisualDiff } from '@/lib/visual-diff';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const pageResult = await query(
    'SELECT * FROM tracked_pages WHERE id = $1 AND user_id = $2',
    [id, user.userId]
  );
  if (pageResult.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const page = pageResult.rows[0];

  const fetchResult = await fetchPage(page.url);
  if (!fetchResult.success) {
    return NextResponse.json({ error: fetchResult.error || 'Fetch failed' }, { status: 502 });
  }

  // Capture screenshot if enabled
  let screenshotS3Key: string | null = null;
  if (page.screenshot_enabled) {
    const screenshotResult = await captureScreenshot(page.url);
    if (screenshotResult.success && screenshotResult.buffer) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      screenshotS3Key = await uploadSnapshot(id, timestamp, screenshotResult.buffer, true);
    }
  }

  const lastSnapshot = await query(
    `SELECT id, s3_key, text_hash, screenshot_s3_key
     FROM snapshots WHERE tracked_page_id = $1
     ORDER BY fetched_at DESC LIMIT 1`,
    [id]
  );

  if (lastSnapshot.rows.length > 0 && lastSnapshot.rows[0].text_hash === fetchResult.textHash) {
    await query('UPDATE tracked_pages SET last_checked_at = NOW() WHERE id = $1', [id]);
    return NextResponse.json({ status: 'no_change', message: 'No changes detected' });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const s3Key = await uploadSnapshot(id, timestamp, fetchResult.rawHtml!);

  const newSnapshot = await query(
    `INSERT INTO snapshots (tracked_page_id, s3_key, screenshot_s3_key, text_hash)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, s3Key, screenshotS3Key, fetchResult.textHash]
  );

  const newSnapshotId = newSnapshot.rows[0].id;
  let diffAdded = 0;
  let diffRemoved = 0;
  let diffSummary = 'Initial snapshot';
  let visualDiffPercent: number | null = null;

  if (lastSnapshot.rows.length > 0) {
    const oldHtml = await downloadSnapshot(lastSnapshot.rows[0].s3_key);
    const oldText = extractVisibleText(oldHtml);
    const diff = computeDiff(oldText, fetchResult.visibleText!);
    diffAdded = diff.added;
    diffRemoved = diff.removed;
    diffSummary = diff.summary;

    // Compute visual diff if both screenshots are available
    const oldScreenshotKey = lastSnapshot.rows[0].screenshot_s3_key;
    if (oldScreenshotKey && screenshotS3Key) {
      try {
        const oldBuf = await downloadScreenshotBuffer(oldScreenshotKey);
        const newBuf = await downloadScreenshotBuffer(screenshotS3Key);
        const vd = computeVisualDiff(oldBuf, newBuf);
        if (vd) visualDiffPercent = vd.diffPercent;
      } catch (err) {
        console.warn('[CheckNow] Visual diff failed:', err);
      }
    }

    await query(
      `INSERT INTO changes (tracked_page_id, old_snapshot_id, new_snapshot_id,
        added_lines_count, removed_lines_count, diff_summary, visual_diff_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, lastSnapshot.rows[0].id, newSnapshotId, diffAdded, diffRemoved, diffSummary, visualDiffPercent]
    );
  } else {
    await query(
      `INSERT INTO changes (tracked_page_id, old_snapshot_id, new_snapshot_id,
        added_lines_count, removed_lines_count, diff_summary)
       VALUES ($1, NULL, $2, 0, 0, $3)`,
      [id, newSnapshotId, diffSummary]
    );
  }

  await query('UPDATE tracked_pages SET last_checked_at = NOW() WHERE id = $1', [id]);

  return NextResponse.json({
    status: diffAdded > 0 || diffRemoved > 0 ? 'changed' : 'initial',
    added: diffAdded,
    removed: diffRemoved,
    summary: diffSummary,
    visualDiffPercent,
  });
}
