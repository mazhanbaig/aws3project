import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/serverAuth';
import { validateEmail, validateString } from '@/lib/validate';
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
      validateString(password, 'password'),
    ].filter((e): e is ValidationError => e != null);

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.map(e => e.message).join(', ') }, { status: 400 });
    }

    const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, email: user.email } });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error('[Login] Unhandled error:', err);
    return NextResponse.json({ error: 'Login failed due to a server error' }, { status: 500 });
  }
}
