import cron from 'node-cron';
import { query } from './db';
import { fetchPage, computeDiff, extractVisibleText } from './scraper';
import { uploadSnapshot, downloadSnapshot } from './s3';

async function processPage(page: { id: number; url: string; label: string }): Promise<void> {
  console.log(`[Scheduler] Checking: ${page.label} (${page.url})`);

  const fetchResult = await fetchPage(page.url);
  if (!fetchResult.success) {
    console.error(`[Scheduler] Fetch failed for ${page.label}: ${fetchResult.error}`);
    return;
  }

  const lastSnapshot = await query(
    'SELECT id, s3_key, text_hash FROM snapshots WHERE tracked_page_id = $1 ORDER BY fetched_at DESC LIMIT 1',
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
    'INSERT INTO snapshots (tracked_page_id, s3_key, text_hash) VALUES ($1, $2, $3) RETURNING id',
    [page.id, s3Key, fetchResult.textHash]
  );

  const newSnapshotId = newSnapshot.rows[0].id;

  if (lastSnapshot.rows.length > 0) {
    const oldKey = lastSnapshot.rows[0].s3_key;
    const oldHtml = await downloadSnapshot(oldKey);
    const oldText = extractVisibleText(oldHtml);
    const diff = computeDiff(oldText, fetchResult.visibleText!);

    await query(
      `INSERT INTO changes (tracked_page_id, old_snapshot_id, new_snapshot_id, added_lines_count, removed_lines_count, diff_summary)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [page.id, lastSnapshot.rows[0].id, newSnapshotId, diff.added, diff.removed, diff.summary]
    );

    console.log(`[Scheduler] Change detected for ${page.label}: ${diff.summary}`);
  } else {
    await query(
      `INSERT INTO changes (tracked_page_id, old_snapshot_id, new_snapshot_id, added_lines_count, removed_lines_count, diff_summary)
       VALUES ($1, NULL, $2, 0, 0, 'Initial snapshot')`,
      [page.id, newSnapshotId]
    );
    console.log(`[Scheduler] Initial snapshot for ${page.label}`);
  }

  await query('UPDATE tracked_pages SET last_checked_at = NOW() WHERE id = $1', [page.id]);
}

export async function sweepDuePages(): Promise<void> {
  const due = await query(
    `SELECT id, url, label FROM tracked_pages
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
