const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SALT_ROUNDS = 10;

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getTokenFromEvent(event) {
  const cookie = event.headers?.Cookie || event.headers?.cookie || '';
  const tokenFromCookie = cookie.split(';').find(c => c.trim().startsWith('token='));
  if (tokenFromCookie) return tokenFromCookie.split('=')[1].trim();
  const auth = event.headers?.Authorization || event.headers?.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken, getTokenFromEvent };
