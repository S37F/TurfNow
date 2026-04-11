import express from 'express';
import { query } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

function rowToReview(row) {
  return {
    id: row.id,
    sport: row.sport,
    turfId: row.turf_id,
    userId: row.user_id,
    userEmail: row.user_email,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

async function updateTurfRating(sport, turfId) {
  try {
    const { rows } = await query(
      `SELECT rating FROM reviews WHERE sport = $1 AND turf_id = $2`,
      [sport, turfId]
    );

    if (rows.length === 0) return;

    const total = rows.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = (total / rows.length).toFixed(1);

    await query(
      `UPDATE turfs SET rating = $1::numeric, total_reviews = $2, updated_at = now() WHERE id = $3::uuid AND sport = $4`,
      [parseFloat(avgRating), rows.length, turfId, sport]
    );
  } catch (error) {
    console.error('Error updating turf rating:', error);
  }
}

router.get('/:sport/:turfId', async (req, res) => {
  try {
    const { sport, turfId } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    const { rows } = await query(
      `SELECT * FROM reviews WHERE sport = $1 AND turf_id = $2 ORDER BY created_at DESC`,
      [sport, turfId]
    );

    res.json({ success: true, data: rows.map(rowToReview) });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { sport, turfId, rating, comment } = req.body;

    if (!sport || !turfId || rating === undefined || !comment) {
      return res.status(400).json({
        success: false,
        error: 'sport, turfId, rating, and comment are required',
      });
    }

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    const numRating = Number(rating);
    if (Number.isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be an integer between 1 and 5',
      });
    }

    const sanitizedComment = comment
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 1000);

    const { rows } = await query(
      `INSERT INTO reviews (sport, turf_id, user_id, user_email, rating, comment)
       VALUES ($1, $2, $3::uuid, $4, $5, $6)
       RETURNING *`,
      [sport, turfId, req.user.uid, req.user.email, numRating, sanitizedComment]
    );

    await updateTurfRating(sport, turfId);

    res.status(201).json({ success: true, data: rowToReview(rows[0]) });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await query('SELECT * FROM reviews WHERE id = $1::uuid', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const reviewData = rows[0];

    if (reviewData.user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM reviews WHERE id = $1::uuid', [id]);

    await updateTurfRating(reviewData.sport, reviewData.turf_id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

export default router;
