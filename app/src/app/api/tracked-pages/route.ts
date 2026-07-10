import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { validateString, validateUrl, validatePositiveInt } from '@/lib/validate';
import type { ValidationError } from '@/lib/validate';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await query(
    `SELECT tp.*, 
      (SELECT COUNT(*) FROM changes c WHERE c.tracked_page_id = tp.id) as changes_count
     FROM tracked_pages tp
     WHERE tp.user_id = $1
     ORDER BY tp.created_at DESC`,
    [user.userId]
  );

  return NextResponse.json({ pages: result.rows });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { label, url, checkIntervalHours } = body;

  const errors: ValidationError[] = [
    validateString(label, 'label', 200),
    validateUrl(url, 'url'),
  ].filter((e): e is ValidationError => e != null);

  if (checkIntervalHours !== undefined) {
    const intervalErr = validatePositiveInt(checkIntervalHours, 'checkIntervalHours');
    if (intervalErr) errors.push(intervalErr);
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.map(e => e.message).join(', ') }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO tracked_pages (user_id, label, url, check_interval_hours)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user.userId, label!.trim(), url!.trim(), Math.min(checkIntervalHours || 24, 168)]
  );

  return NextResponse.json({ page: result.rows[0] }, { status: 201 });
}
