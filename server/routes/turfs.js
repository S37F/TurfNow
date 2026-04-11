import express from 'express';
import { query } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
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

router.get('/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { city, available, minPrice, maxPrice } = req.query;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sport. Allowed: ${ALLOWED_SPORTS.join(', ')}`,
      });
    }

    const conditions = ['sport = $1'];
    const params = [sport];
    let i = 2;

    if (city) {
      conditions.push(`city = $${i++}`);
      params.push(city);
    }
    if (available !== undefined) {
      const isAvailable = available === 'true' || available === '1';
      conditions.push(`available = $${i++}`);
      params.push(isAvailable);
    }

    const sql = `SELECT * FROM turfs WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
    const { rows } = await query(sql, params);

    let turfs = rows.map(rowToTurf);

    if (minPrice || maxPrice) {
      turfs = turfs.filter((turf) => {
        const price = turf.pricePerHour || 0;
        if (minPrice && price < parseInt(minPrice, 10)) return false;
        if (maxPrice && price > parseInt(maxPrice, 10)) return false;
        return true;
      });
    }

    res.json({ success: true, data: turfs });
  } catch (error) {
    console.error('Error fetching turfs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch turfs' });
  }
});

router.get('/:sport/:id', async (req, res) => {
  try {
    const { sport, id } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    const { rows } = await query(
      'SELECT * FROM turfs WHERE id = $1::uuid AND sport = $2',
      [id, sport]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    res.json({ success: true, data: rowToTurf(rows[0]) });
  } catch (error) {
    console.error('Error fetching turf:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch turf' });
  }
});

router.post('/:sport', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sport } = req.params;
    const { name, address, city, image, pricePerHour, facilities, size, description, ownerId } = req.body;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }
    if (!name || !address || !city || pricePerHour === undefined) {
      return res.status(400).json({ success: false, error: 'name, address, city, and pricePerHour are required' });
    }

    const now = new Date().toISOString();
    const { rows } = await query(
      `INSERT INTO turfs (
        sport, name, address, city, image, price_per_hour, facilities, size, description, owner_id,
        available, rating, total_reviews, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,true,0,0,$11::timestamptz,$12::timestamptz)
      RETURNING *`,
      [
        sport,
        name,
        address,
        city,
        image || '',
        Number(pricePerHour),
        JSON.stringify(facilities || []),
        size || '',
        description || '',
        ownerId || '',
        now,
        now,
      ]
    );

    res.status(201).json({ success: true, data: rowToTurf(rows[0]) });
  } catch (error) {
    console.error('Error creating turf:', error);
    res.status(500).json({ success: false, error: 'Failed to create turf' });
  }
});

router.put('/:sport/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sport, id } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    const allowedFields = ['name', 'address', 'city', 'image', 'pricePerHour', 'facilities', 'size', 'description', 'available', 'ownerId'];
    const sets = [];
    const params = [];
    let i = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        const col =
          field === 'pricePerHour'
            ? 'price_per_hour'
            : field === 'ownerId'
              ? 'owner_id'
              : field;
        if (field === 'facilities') {
          sets.push(`facilities = $${i++}::jsonb`);
          params.push(JSON.stringify(req.body[field]));
        } else {
          sets.push(`${col} = $${i++}`);
          params.push(req.body[field]);
        }
      }
    }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    sets.push(`updated_at = $${i++}::timestamptz`);
    params.push(new Date().toISOString());
    params.push(id, sport);

    const sql = `UPDATE turfs SET ${sets.join(', ')} WHERE id = $${i++}::uuid AND sport = $${i} RETURNING *`;
    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    res.json({
      success: true,
      message: 'Turf updated successfully',
      data: rowToTurf(rows[0]),
    });
  } catch (error) {
    console.error('Error updating turf:', error);
    res.status(500).json({ success: false, error: 'Failed to update turf' });
  }
});

router.delete('/:sport/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sport, id } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    const { rowCount } = await query('DELETE FROM turfs WHERE id = $1::uuid AND sport = $2', [id, sport]);

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    res.json({ success: true, message: 'Turf deleted successfully' });
  } catch (error) {
    console.error('Error deleting turf:', error);
    res.status(500).json({ success: false, error: 'Failed to delete turf' });
  }
});

export default router;
