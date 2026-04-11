import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { query } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { getJwtSecret } from '../config/jwt.js';

const router = express.Router();
const SALT_ROUNDS = 10;
const TOKEN_EXPIRES = '7d';

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name || null,
    isAdmin: !!row.is_admin,
    isOwner: !!row.is_owner,
  };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: TOKEN_EXPIRES });
}

router.post('/register', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const displayName = (req.body.displayName || '').trim() || null;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const { rows: existing } = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'An account already exists with this email' });
    }

    const { rows: countRows } = await query('SELECT COUNT(*) AS c FROM users');
    const userCount = parseInt(String(countRows[0]?.c ?? 0), 10);
    const isAdmin = userCount === 0 ? 1 : 0;

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date().toISOString();

    const { rows } = await query(
      `INSERT INTO users (id, email, password_hash, display_name, is_admin, is_owner, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6)
       RETURNING id, email, display_name, is_admin, is_owner`,
      [id, email, passwordHash, displayName, isAdmin, now]
    );

    const user = publicUser(rows[0]);
    const token = signToken(user.id);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const { rows } = await query(
      'SELECT id, email, password_hash, display_name, is_admin, is_owner FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password' });
    }

    const row = rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password' });
    }

    const user = publicUser(row);
    const token = signToken(user.id);

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.uid,
      email: req.user.email,
      displayName: req.user.displayName ?? null,
      isAdmin: req.user.admin,
      isOwner: req.user.owner,
    },
  });
});

export default router;
