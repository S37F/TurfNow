import express from 'express';
import { realtimeDb, db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/email.js';
import { ALLOWED_TIME_SLOTS, BOOKING_STATUSES, ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

// Get current user's bookings (matches frontend bookingAPI.getMyBookings)
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await realtimeDb.ref('bookings')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) {
      return res.json({ success: true, data: [] });
    }

    const bookings = Object.entries(data).map(([id, booking]) => ({
      id,
      ...booking
    }));

    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Get user bookings by userId (returns ALL bookings for a user)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own bookings
    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const snapshot = await realtimeDb.ref('bookings')
      .orderByChild('userId')
      .equalTo(userId)
      .once('value');
    
    const data = snapshot.val();
    
    if (!data) {
      return res.json({ success: true, data: [] });
    }

    // Convert to array with IDs
    const bookings = Object.entries(data).map(([id, booking]) => ({
      id,
      ...booking
    }));

    // Sort by createdAt descending
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Create new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking, time, bookingDate, sport } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    // Input validation
    if (!booking || !time || !bookingDate || !sport) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: booking, time, bookingDate, sport' 
      });
    }

    if (!booking.name || typeof booking.name !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid booking data: turf name is required' 
      });
    }

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid sport. Allowed: ${ALLOWED_SPORTS.join(', ')}` 
      });
    }

    // Validate date is not in the past
    const bookDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bookDate.getTime()) || bookDate < today) {
      return res.status(400).json({ 
        success: false, 
        error: 'Booking date must be today or in the future' 
      });
    }

    // Check if slot is already booked using a more targeted query
    const slotQuery = realtimeDb.ref('bookings')
      .orderByChild('turfName')
      .equalTo(booking.name);
    const existingSnapshot = await slotQuery.once('value');
    const existingBookings = existingSnapshot.val() || {};
    
    const isSlotTaken = Object.values(existingBookings).some(existingBooking => {
      return (
        existingBooking.time === time &&
        existingBooking.bookingDate === bookingDate &&
        existingBooking.status !== 'cancelled'
      );
    });

    if (isSlotTaken) {
      return res.status(400).json({ 
        success: false, 
        error: 'This slot is already booked' 
      });
    }

    // Create booking with unique push key
    const newBookingRef = realtimeDb.ref('bookings').push();
    const bookingData = {
      userId,
      email: userEmail,
      turfName: booking.name,
      turfImage: booking.image || '',
      turfAddress: booking.address || '',
      turfPrice: booking.pricePerHour || 0,
      sport,
      time,
      bookingDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await newBookingRef.set(bookingData);

    // Send booking confirmation email
    try {
      await sendEmail(
        userEmail,
        'TurfNow - Booking Confirmation 🏟️',
        emailTemplates.bookingConfirmation({
          customerName: userEmail.split('@')[0],
          turfName: booking.name,
          date: bookingDate,
          time: time,
          amount: booking.pricePerHour || 'TBD',
          bookingId: newBookingRef.key.substring(0, 8).toUpperCase()
        })
      );
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError.message);
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      data: { id: newBookingRef.key, ...bookingData }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

// Cancel booking (matches frontend bookingAPI.cancelBooking)
router.patch('/:bookingId/cancel', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const snapshot = await realtimeDb.ref(`bookings/${bookingId}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const bookingData = snapshot.val();
    if (bookingData.userId !== req.user.uid) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (bookingData.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    await realtimeDb.ref(`bookings/${bookingId}`).update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });

    // Send cancellation email
    if (bookingData.email) {
      try {
        await sendEmail(
          bookingData.email,
          'TurfNow - Booking Cancelled',
          emailTemplates.bookingCancellation({
            customerName: bookingData.email.split('@')[0],
            turfName: bookingData.turfName || 'Your turf',
            date: bookingData.bookingDate,
            time: bookingData.time,
            refundAmount: null,
            refundStatus: 'Refund will be processed within 5-7 business days'
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

// Update booking status
router.patch('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status || !BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Allowed: ${BOOKING_STATUSES.join(', ')}` 
      });
    }

    // Fetch booking and verify ownership
    const snapshot = await realtimeDb.ref(`bookings/${bookingId}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = snapshot.val();
    if (booking.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await realtimeDb.ref(`bookings/${bookingId}`).update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Booking updated successfully' 
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// Cancel booking
router.delete('/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Fetch booking and verify ownership
    const snapshot = await realtimeDb.ref(`bookings/${bookingId}`).once('value');
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = snapshot.val();
    if (bookingData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft-delete: mark as cancelled rather than removing
    await realtimeDb.ref(`bookings/${bookingId}`).update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });

    // Send cancellation email
    if (bookingData.email) {
      try {
        await sendEmail(
          bookingData.email,
          'TurfNow - Booking Cancelled',
          emailTemplates.bookingCancellation({
            customerName: bookingData.email.split('@')[0],
            turfName: bookingData.turfName || 'Your turf',
            date: bookingData.bookingDate,
            time: bookingData.time,
            refundAmount: null,
            refundStatus: 'Refund will be processed within 5-7 business days'
          })
        );
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError.message);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  }
});

// Get all booked slots for a specific turf and date (public - for calendar)
router.get('/slots/:turfName/:date', async (req, res) => {
  try {
    const { turfName, date } = req.params;
    
    const snapshot = await realtimeDb.ref('bookings').once('value');
    const allBookings = snapshot.val() || {};
    
    const bookedSlots = [];
    Object.values(allBookings).forEach(booking => {
      if (
        booking.turfName === turfName &&
        booking.bookingDate === date &&
        booking.status !== 'cancelled'
      ) {
        bookedSlots.push(booking.time);
      }
    });

    res.json({ success: true, data: bookedSlots });
  } catch (error) {
    console.error('Error fetching booked slots:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booked slots' });
  }
});

export default router;
