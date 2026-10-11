import jwt from 'jsonwebtoken';
import { get } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_team_foundation_jwt_secret_key_2026_secure';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await get('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await get('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?', [decoded.id]);
      if (user) req.user = user;
    } catch {
      // ignore token verification error in optionalAuth
    }
  }
  next();
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export default { authenticateToken, optionalAuth, generateToken };
