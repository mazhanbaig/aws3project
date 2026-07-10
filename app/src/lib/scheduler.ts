import cron from 'node-cron';
import { query } from './db';
import { fetchPage, computeDiff, extractVisibleText } from './scraper';
import { uploadSnapshot, downloadSnapshot, downloadScreenshotBuffer } from './s3';
import { captureScreenshot, closeBrowser } from './screenshot';
import { computeVisualDiff } from './visual-diff';

async function processPage(page: { id: number; url: string; label: string; screenshot_enabled: boolean }): Promise<void> {
  console.log(`[Scheduler] Checking: ${page.label} (${page.url})`);

  const fetchResult = await fetchPage(page.url);
  if (!fetchResult.success) {
    console.error(`[Scheduler] Fetch failed for ${page.label}: ${fetchResult.error}`);
    return;
  }

  // Capture screenshot if enabled
  let screenshotS3Key: string | null = null;
  let screenshotHash: string | null = null;
  if (page.screenshot_enabled) {
    const screenshotResult = await captureScreenshot(page.url);
    if (screenshotResult.success && screenshotResult.buffer) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      screenshotS3Key = await uploadSnapshot(page.id, timestamp, screenshotResult.buffer, true);
      screenshotHash = screenshotResult.buffer.length.toString(); // rough hash for comparison
    } else {
      console.warn(`[Scheduler] Screenshot failed for ${page.label}: ${screenshotResult.error}`);
    }
  }

  const lastSnapshot = await query(
    `SELECT id, s3_key, text_hash, screenshot_s3_key
     FROM snapshots WHERE tracked_page_id = $1
     ORDER BY fetched_at DESC LIMIT 1`,
    [page.id]
  );

  if (lastSnapshot.rows.length > 0 && lastSnapshot.rows[0].text_hash === fetchResult.textHash) {
    await query('UPDATE tracked_pages SET last_checked_at = NOW() WHERE id = $1', [page.id]);
    console.log(`[Scheduler] No change for ${page.label}`);
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const s3Key = await uploadSnapshot(page.id, timestamp, fetchResult.rawHtml!);

  const newSnapshot = await query(
    `INSERT INTO snapshots (tracked_page_id, s3_key, screenshot_s3_key, text_hash)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [page.id, s3Key, screenshotS3Key, fetchResult.textHash]
  );

  const newSnapshotId = newSnapshot.rows[0].id;

  if (lastSnapshot.rows.length > 0) {
    const oldKey = lastSnapshot.rows[0].s3_key;
    const oldHtml = await downloadSnapshot(oldKey);
    const oldText = extractVisibleText(oldHtml);
    const diff = computeDiff(oldText, fetchResult.visibleText!);

    // Check for visual diff between screenshots if available
    let visualDiffPercent: number | null = null;
    const oldScreenshotKey = lastSnapshot.rows[0].screenshot_s3_key;
    if (oldScreenshotKey && screenshotS3Key) {
      try {
        const oldScreenshotBuf = await downloadScreenshotBuffer(oldScreenshotKey);
        const newScreenshotBuf = await downloadScreenshotBuffer(screenshotS3Key);
        const vDiff = computeVisualDiff(oldScreenshotBuf, newScreenshotBuf);
        if (vDiff) {
          visualDiffPercent = vDiff.diffPercent;
        }
      } catch (err) {
        console.warn(`[Scheduler] Visual diff failed for ${page.label}:`, err);
      }
    }

    await query(
      `INSERT INTO changes (tracked_page_id, old_snapshot_id, new_snapshot_id,
        added_lines_count, removed_lines_count, diff_summary, visual_diff_percent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [page.id, lastSnapshot.rows[0].id, newSnapshotId,
        diff.added, diff.removed, diff.summary, visualDiffPercent]
    );

    console.log(`[Scheduler] Change detected for ${page.label}: ${diff.summary}` +
      (visualDiffPercent !== null ? ` (${visualDiffPercent}% visual change)` : ''));
  } else {
    await query(
      `INSERT INTO changes (tracked_page_id, old_snapshot_id, new_snapshot_id,
        added_lines_count, removed_lines_count, diff_summary)
       VALUES ($1, NULL, $2, 0, 0, 'Initial snapshot')`,
      [page.id, newSnapshotId]
    );
    console.log(`[Scheduler] Initial snapshot for ${page.label}`);
  }

  await query('UPDATE tracked_pages SET last_checked_at = NOW() WHERE id = $1', [page.id]);
}

export async function sweepDuePages(): Promise<void> {
  const due = await query(
    `SELECT id, url, label, screenshot_enabled FROM tracked_pages
     WHERE last_checked_at IS NULL
        OR last_checked_at <= NOW() - (check_interval_hours || ' hours')::INTERVAL`
  );

  for (const page of due.rows) {
    await processPage(page);
  }
}

export function startScheduler(): void {
  cron.schedule('*/30 * * * *', () => {
    sweepDuePages().catch((err) => console.error('[Scheduler] Sweep error:', err));
  });
  console.log('[Scheduler] Started — checking every 30 minutes');
}

export async function stopScheduler(): Promise<void> {
  await closeBrowser();
  console.log('[Scheduler] Browser closed');
}
