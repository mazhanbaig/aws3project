const { query, initSchema, success, error } = require('../shared/db');
const { hashPassword } = require('../shared/auth');

exports.handler = async (event) => {
  try {
    await initSchema();
    const { email, password, displayName } = JSON.parse(event.body || '{}');
    if (!email || !password) return error('Email and password required');
    if (password.length < 6) return error('Password must be at least 6 characters');

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return error('Email already registered', 409);

    const passwordHash = hashPassword(password);
    const result = await query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at',
      [email.toLowerCase(), passwordHash, displayName || email.split('@')[0]]
    );

    return success({ user: result.rows[0] }, 201);
  } catch (err) {
    console.error('Signup error:', err);
    return error('Internal server error', 500);
  }
};
