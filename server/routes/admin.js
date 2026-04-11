import express from 'express';
import { getSupabaseAdmin } from '../config/supabaseAdmin.js';
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
      const count = rows[0]?.c ?? 0;
      stats.sportWise[sport] = count;
      stats.totalTurfs += count;
    }

    const { rows: bc } = await query('SELECT COUNT(*)::int AS c FROM bookings');
    stats.totalBookings = bc[0]?.c ?? 0;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      let page = 1;
      const perPage = 1000;
      let totalUsers = 0;
      while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) break;
        totalUsers += data.users.length;
        if (data.users.length < perPage) break;
        page += 1;
      }
      stats.totalUsers = totalUsers;
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

router.post('/make-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Auth admin not configured' });
    }

    const { data: existing, error: getErr } = await supabase.auth.admin.getUserById(userId);
    if (getErr || !existing.user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const meta = existing.user.app_metadata || {};
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { ...meta, admin: true },
    });
    if (error) throw error;

    res.json({ success: true, message: 'User is now an admin' });
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin status' });
  }
});

router.post('/remove-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Auth admin not configured' });
    }

    const { data: existing, error: getErr } = await supabase.auth.admin.getUserById(userId);
    if (getErr || !existing.user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const meta = { ...(existing.user.app_metadata || {}) };
    delete meta.admin;

    const { error } = await supabase.auth.admin.updateUserById(userId, { app_metadata: meta });
    if (error) throw error;

    res.json({ success: true, message: 'Admin privileges removed' });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ success: false, error: 'Failed to remove admin' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Auth admin not configured' });
    }

    const allUsers = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      allUsers.push(...data.users);
      if (data.users.length < perPage) break;
      page += 1;
    }

    const users = allUsers.map((user) => ({
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      isAdmin: user.app_metadata?.admin === true,
      isOwner: user.app_metadata?.owner === true,
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
