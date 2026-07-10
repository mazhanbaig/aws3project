import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { downloadSnapshot } from '@/lib/s3';
import { computeDiffView } from '@/lib/diff-view';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const page = await query('SELECT id FROM tracked_pages WHERE id = $1 AND user_id = $2', [id, user.userId]);
  if (page.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const changes = await query(
    `SELECT c.*, 
      old_snap.s3_key as old_s3_key, old_snap.fetched_at as old_fetched_at,
      new_snap.s3_key as new_s3_key, new_snap.fetched_at as new_fetched_at
     FROM changes c
     LEFT JOIN snapshots old_snap ON c.old_snapshot_id = old_snap.id
     JOIN snapshots new_snap ON c.new_snapshot_id = new_snap.id
     WHERE c.tracked_page_id = $1
     ORDER BY c.detected_at DESC
     LIMIT 50`,
    [id]
  );

  return NextResponse.json({ changes: changes.rows });
}
