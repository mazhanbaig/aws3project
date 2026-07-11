import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const page = await query('SELECT id FROM tracked_pages WHERE id = $1 AND user_id = $2', [id, user.userId]);
    if (page.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await query('DELETE FROM tracked_pages WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[TrackedPage DELETE] Error:', err);
    return NextResponse.json({ error: 'Failed to delete tracked page' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const result = await query(
      'SELECT * FROM tracked_pages WHERE id = $1 AND user_id = $2',
      [id, user.userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ page: result.rows[0] });
  } catch (err) {
    console.error('[TrackedPage GET] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracked page' }, { status: 500 });
  }
}
