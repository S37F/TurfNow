import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

function rowToBooking(row) {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    turfName: row.turf_name,
    turfImage: row.turf_image,
    turfAddress: row.turf_address,
    turfPrice: row.turf_price != null ? Number(row.turf_price) : null,
    sport: row.sport,
    time: row.time,
    bookingDate: row.booking_date,
    status: row.status,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    cancelledAt: row.cancelled_at?.toISOString?.() ?? row.cancelled_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

router.get('/bookings', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM bookings ORDER BY created_at DESC`);
    res.json({ success: true, data: rows.map(rowToBooking) });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalTurfs: 0,
      totalBookings: 0,
      totalUsers: 0,
      totalRevenue: 0,
      sportWise: {},
    };

    for (const sport of ALLOWED_SPORTS) {
      const { rows } = await query('SELECT COUNT(*)::int AS c FROM turfs WHERE sport = $1', [sport]);
      const count = parseInt(String(rows[0]?.c ?? 0), 10);
      stats.sportWise[sport] = count;
      stats.totalTurfs += count;
    }

    const { rows: bc } = await query('SELECT COUNT(*)::int AS c FROM bookings');
    stats.totalBookings = parseInt(String(bc[0]?.c ?? 0), 10);

    const { rows: uc } = await query('SELECT COUNT(*)::int AS c FROM users');
    stats.totalUsers = parseInt(String(uc[0]?.c ?? 0), 10);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

router.post('/make-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { rows } = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await query('UPDATE users SET is_admin = 1 WHERE id = $1', [userId]);

    res.json({ success: true, message: 'User is now an admin' });
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin status' });
  }
});

router.post('/remove-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.uid) {
      return res.status(400).json({ success: false, error: 'You cannot remove your own admin privileges' });
    }

    const { rows } = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await query('UPDATE users SET is_admin = 0 WHERE id = $1', [userId]);

    res.json({ success: true, message: 'Admin privileges removed' });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ success: false, error: 'Failed to remove admin' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, email, display_name, is_admin, is_owner, created_at FROM users ORDER BY created_at DESC`
    );

    const users = rows.map((row) => ({
      uid: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at,
      lastSignIn: null,
      isAdmin: !!row.is_admin,
      isOwner: !!row.is_owner,
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
