import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/email.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

function parseJsonField(val, fallback) {
  if (val == null) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return val;
}

function rowToOwner(row) {
  return {
    id: row.user_id,
    uid: row.user_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    businessName: row.business_name,
    businessAddress: row.business_address,
    city: row.city,
    sportTypes: parseJsonField(row.sport_types, []),
    description: row.description,
    status: row.status,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
    approvedAt: row.approved_at?.toISOString?.() ?? row.approved_at,
    approvedBy: row.approved_by,
    rejectedAt: row.rejected_at?.toISOString?.() ?? row.rejected_at,
    rejectedBy: row.rejected_by,
    rejectionReason: row.rejection_reason,
    turfs: parseJsonField(row.turfs, []),
  };
}

function rowToTurf(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    image: row.image,
    pricePerHour: Number(row.price_per_hour),
    facilities: parseJsonField(row.facilities, []),
    size: row.size,
    description: row.description,
    ownerId: row.owner_id,
    available: Boolean(row.available),
    rating: Number(row.rating),
    totalReviews: row.total_reviews,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
    updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
  };
}

router.post('/register', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;
    const {
      fullName, phone, businessName,
      businessAddress, city, sportTypes, description,
    } = req.body;

    if (!fullName || !phone || !businessName || !businessAddress || !city) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided: fullName, phone, businessName, businessAddress, city',
      });
    }

    if (!/^[\d\s+\-()]{7,15}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    const existing = await query('SELECT 1 FROM owner_profiles WHERE user_id = $1::uuid', [uid]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already registered as a turf owner',
      });
    }

    const now = new Date().toISOString();
    await query(
      `INSERT INTO owner_profiles (
        user_id, email, full_name, phone, business_name, business_address, city,
        sport_types, description, status, created_at, updated_at, turfs
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, 'pending', $10::timestamptz, $11::timestamptz, '[]'::jsonb)`,
      [
        uid,
        email,
        fullName,
        phone,
        businessName,
        businessAddress,
        city,
        JSON.stringify(sportTypes || []),
        description || '',
        now,
        now,
      ]
    );

    try {
      await sendEmail(
        email,
        'TurfNow - Owner Registration Received',
        emailTemplates.ownerRegistrationPending({ fullName, businessName })
      );
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Pending admin approval.',
      data: { uid, status: 'pending' },
    });
  } catch (error) {
    console.error('Error registering owner:', error);
    res.status(500).json({ success: false, error: 'Failed to register' });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM owner_profiles WHERE user_id = $1::uuid', [req.user.uid]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Owner profile not found' });
    }

    res.json({ success: true, data: rowToOwner(rows[0]) });
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, phone, businessName, businessAddress, city, description } = req.body;

    const updates = ['updated_at = $1::timestamptz'];
    const params = [new Date().toISOString()];
    let i = 2;

    if (fullName) {
      updates.push(`full_name = $${i++}`);
      params.push(fullName);
    }
    if (phone) {
      updates.push(`phone = $${i++}`);
      params.push(phone);
    }
    if (businessName) {
      updates.push(`business_name = $${i++}`);
      params.push(businessName);
    }
    if (businessAddress) {
      updates.push(`business_address = $${i++}`);
      params.push(businessAddress);
    }
    if (city) {
      updates.push(`city = $${i++}`);
      params.push(city);
    }
    if (description !== undefined) {
      updates.push(`description = $${i++}`);
      params.push(description);
    }

    params.push(req.user.uid);

    const { rowCount } = await query(
      `UPDATE owner_profiles SET ${updates.join(', ')} WHERE user_id = $${i}::uuid`,
      params
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Owner profile not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating owner profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let sql = 'SELECT * FROM owner_profiles';
    const params = [];
    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const { rows } = await query(sql, params);
    res.json({ success: true, data: rows.map(rowToOwner) });
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch owners' });
  }
});

router.post('/:ownerId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ownerId } = req.params;

    const { rows } = await query('SELECT * FROM owner_profiles WHERE user_id = $1::uuid', [ownerId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Owner not found' });
    }

    const owner = rows[0];

    const { rows: userRows } = await query('SELECT id FROM users WHERE id = $1', [ownerId]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    await query('UPDATE users SET is_owner = true WHERE id = $1', [ownerId]);

    await query(
      `UPDATE owner_profiles SET status = 'approved', approved_at = $1::timestamptz, approved_by = $2::uuid, updated_at = $1::timestamptz WHERE user_id = $3::uuid`,
      [new Date().toISOString(), req.user.uid, ownerId]
    );

    try {
      await sendEmail(
        owner.email,
        'TurfNow - Your Owner Account is Approved! 🎉',
        emailTemplates.ownerApproved({ fullName: owner.full_name, businessName: owner.business_name })
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError.message);
    }

    res.json({ success: true, message: 'Owner approved successfully' });
  } catch (error) {
    console.error('Error approving owner:', error);
    res.status(500).json({ success: false, error: 'Failed to approve owner' });
  }
});

router.post('/:ownerId/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { reason } = req.body;

    const { rows } = await query('SELECT * FROM owner_profiles WHERE user_id = $1::uuid', [ownerId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Owner not found' });
    }

    const owner = rows[0];
    const now = new Date().toISOString();
    const rejectionReason = reason || 'Application did not meet requirements';

    await query(
      `UPDATE owner_profiles SET status = 'rejected', rejected_at = $1::timestamptz, rejected_by = $2::uuid, rejection_reason = $3, updated_at = $1::timestamptz WHERE user_id = $4::uuid`,
      [now, req.user.uid, rejectionReason, ownerId]
    );

    await query('UPDATE users SET is_owner = false WHERE id = $1', [ownerId]);

    try {
      await sendEmail(
        owner.email,
        'TurfNow - Owner Application Update',
        emailTemplates.ownerRejected({
          fullName: owner.full_name,
          reason: rejectionReason,
        })
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError.message);
    }

    res.json({ success: true, message: 'Owner rejected' });
  } catch (error) {
    console.error('Error rejecting owner:', error);
    res.status(500).json({ success: false, error: 'Failed to reject owner' });
  }
});

router.get('/my-turfs', verifyToken, async (req, res) => {
  try {
    const { rows: op } = await query('SELECT * FROM owner_profiles WHERE user_id = $1::uuid', [req.user.uid]);

    if (op.length === 0) {
      return res.status(404).json({ success: false, error: 'Owner profile not found' });
    }

    if (op[0].status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Your owner account is not approved yet',
      });
    }

    const turfs = [];
    for (const sport of ALLOWED_SPORTS) {
      const { rows } = await query(
        'SELECT * FROM turfs WHERE sport = $1 AND owner_id = $2',
        [sport, req.user.uid]
      );
      rows.forEach((row) => turfs.push({ sport, ...rowToTurf(row) }));
    }

    res.json({ success: true, data: turfs });
  } catch (error) {
    console.error('Error fetching owner turfs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch turfs' });
  }
});

router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const turfNames = new Set();
    for (const sport of ALLOWED_SPORTS) {
      const { rows } = await query(
        'SELECT name FROM turfs WHERE sport = $1 AND owner_id = $2',
        [sport, req.user.uid]
      );
      rows.forEach((r) => turfNames.add(r.name));
    }

    if (turfNames.size === 0) {
      return res.json({ success: true, data: [] });
    }

    const { rows: allBookings } = await query(`SELECT * FROM bookings ORDER BY created_at DESC`);
    const bookings = allBookings
      .filter((b) => turfNames.has(b.turf_name))
      .map((row) => ({
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
      }));

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

export default router;
