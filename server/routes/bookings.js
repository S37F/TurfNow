import express from 'express';
import { query } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/email.js';
import { BOOKING_STATUSES, ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

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

router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const { rows } = await query(
      `SELECT * FROM bookings WHERE user_id = $1::uuid ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows.map(rowToBooking) });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows } = await query(
      `SELECT * FROM bookings WHERE user_id = $1::uuid ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows.map(rowToBooking) });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking, time, bookingDate, sport } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    if (!booking || !time || !bookingDate || !sport) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: booking, time, bookingDate, sport',
      });
    }

    if (!booking.name || typeof booking.name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking data: turf name is required',
      });
    }

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sport. Allowed: ${ALLOWED_SPORTS.join(', ')}`,
      });
    }

    const bookDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(bookDate.getTime()) || bookDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Booking date must be today or in the future',
      });
    }

    const conflict = await query(
      `SELECT 1 FROM bookings
       WHERE turf_name = $1 AND booking_date = $2 AND time = $3 AND status <> 'cancelled'`,
      [booking.name, bookingDate, time]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'This slot is already booked',
      });
    }

    const now = new Date().toISOString();
    const { rows } = await query(
      `INSERT INTO bookings (
        user_id, email, turf_name, turf_image, turf_address, turf_price, sport, time, booking_date, status, created_at
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10::timestamptz)
      RETURNING *`,
      [
        userId,
        userEmail,
        booking.name,
        booking.image || '',
        booking.address || '',
        booking.pricePerHour || 0,
        sport,
        time,
        bookingDate,
        now,
      ]
    );

    const created = rowToBooking(rows[0]);

    try {
      await sendEmail(
        userEmail,
        'TurfNow - Booking Confirmation 🏟️',
        emailTemplates.bookingConfirmation({
          customerName: userEmail.split('@')[0],
          turfName: booking.name,
          date: bookingDate,
          time,
          amount: booking.pricePerHour || 'TBD',
          bookingId: String(created.id).substring(0, 8).toUpperCase(),
        })
      );
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: created,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

router.patch('/:bookingId/cancel', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { rows } = await query('SELECT * FROM bookings WHERE id = $1::uuid', [bookingId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const bookingData = rows[0];
    if (bookingData.user_id !== req.user.uid) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (bookingData.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    const cancelledAt = new Date().toISOString();
    await query(
      `UPDATE bookings SET status = 'cancelled', cancelled_at = $1::timestamptz WHERE id = $2::uuid`,
      [cancelledAt, bookingId]
    );

    if (bookingData.email) {
      try {
        await sendEmail(
          bookingData.email,
          'TurfNow - Booking Cancelled',
          emailTemplates.bookingCancellation({
            customerName: bookingData.email.split('@')[0],
            turfName: bookingData.turf_name || 'Your turf',
            date: bookingData.booking_date,
            time: bookingData.time,
            refundAmount: null,
            refundStatus: 'Refund will be processed within 5-7 business days',
          })
        );
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError.message);
      }
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

router.patch('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status || !BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${BOOKING_STATUSES.join(', ')}`,
      });
    }

    const { rows } = await query('SELECT * FROM bookings WHERE id = $1::uuid', [bookingId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = rows[0];
    if (booking.user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query(
      `UPDATE bookings SET status = $1, updated_at = $2::timestamptz WHERE id = $3::uuid`,
      [status, new Date().toISOString(), bookingId]
    );

    res.json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

router.delete('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { rows } = await query('SELECT * FROM bookings WHERE id = $1::uuid', [bookingId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = rows[0];
    if (bookingData.user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const cancelledAt = new Date().toISOString();
    await query(
      `UPDATE bookings SET status = 'cancelled', cancelled_at = $1::timestamptz WHERE id = $2::uuid`,
      [cancelledAt, bookingId]
    );

    if (bookingData.email) {
      try {
        await sendEmail(
          bookingData.email,
          'TurfNow - Booking Cancelled',
          emailTemplates.bookingCancellation({
            customerName: bookingData.email.split('@')[0],
            turfName: bookingData.turf_name || 'Your turf',
            date: bookingData.booking_date,
            time: bookingData.time,
            refundAmount: null,
            refundStatus: 'Refund will be processed within 5-7 business days',
          })
        );
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError.message);
      }
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

router.get('/slots/:turfName/:date', async (req, res) => {
  try {
    const { turfName, date } = req.params;

    const { rows } = await query(
      `SELECT time FROM bookings
       WHERE turf_name = $1 AND booking_date = $2 AND status <> 'cancelled'`,
      [decodeURIComponent(turfName), date]
    );

    res.json({ success: true, data: rows.map((r) => r.time) });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booked slots' });
  }
});

export default router;
