const { query, success, error } = require('../shared/db');
const { comparePassword, signToken } = require('../shared/auth');

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return error('Email and password required');

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) return error('Invalid credentials', 401);

    const user = result.rows[0];
    if (!comparePassword(password, user.password_hash)) return error('Invalid credentials', 401);

    const token = signToken({ userId: user.id, email: user.email });

    return success({
      token,
      user: { id: user.id, email: user.email, display_name: user.display_name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return error('Internal server error', 500);
  }
};
