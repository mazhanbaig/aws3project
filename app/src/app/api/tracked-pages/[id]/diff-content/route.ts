import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { query } from '@/lib/db';
import { extractVisibleText } from '@/lib/scraper';
import { downloadSnapshot } from '@/lib/s3';
import { computeDiffView } from '@/lib/diff-view';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  // Verify the user owns this tracked page
  const page = await query('SELECT id FROM tracked_pages WHERE id = $1 AND user_id = $2', [id, user.userId]);
  if (page.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { oldS3Key, newS3Key } = await req.json();

  if (!newS3Key) {
    return NextResponse.json({ error: 'newS3Key is required' }, { status: 400 });
  }

  try {
    const newHtml = await downloadSnapshot(newS3Key);
    const newText = extractVisibleText(newHtml);

    if (!oldS3Key) {
      return NextResponse.json({
        lines: [{ type: 'initial', text: 'Initial snapshot — no previous version to compare.' }],
      });
    }

    const oldHtml = await downloadSnapshot(oldS3Key);
    const oldText = extractVisibleText(oldHtml);
    const lines = computeDiffView(oldText, newText);

    return NextResponse.json({ lines });
  } catch (err) {
    console.error('[DiffContent] Error:', err);
    return NextResponse.json({ error: 'Failed to load diff content' }, { status: 500 });
  }
}
