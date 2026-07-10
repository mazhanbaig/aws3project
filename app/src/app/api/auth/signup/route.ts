import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/serverAuth';
import { validateEmail, validatePassword } from '@/lib/validate';
import type { ValidationError } from '@/lib/validate';

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { email, password } = body;

    const errors: ValidationError[] = [
      validateEmail(email),
      validatePassword(password),
    ].filter((e): e is ValidationError => e != null);

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.map(e => e.message).join(', ') }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    const user = result.rows[0];
    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error('[Signup] Unhandled error:', err);
    return NextResponse.json({ error: 'Signup failed due to a server error' }, { status: 500 });
  }
}
