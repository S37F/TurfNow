import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { getJwtSecret } from '../config/jwt.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const userId = decoded.sub;
    if (!userId) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { rows } = await query(
      'SELECT id, email, display_name, is_admin, is_owner FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const row = rows[0];
    req.user = {
      sub: row.id,
      uid: row.id,
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      admin: !!row.is_admin,
      owner: !!row.is_owner,
    };
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.admin === true) {
    return next();
  }
  res.status(403).json({ error: 'Access denied. Admin only.' });
};

export const isOwner = (req, res, next) => {
  if (req.user?.owner === true) {
    return next();
  }
  res.status(403).json({ error: 'Access denied. Approved turf owners only.' });
};
