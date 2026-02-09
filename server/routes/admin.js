import express from 'express';
import { auth, db, realtimeDb } from '../config/firebase.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

// All routes require admin access
router.use(verifyToken, isAdmin);

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const snapshot = await realtimeDb.ref('bookings').once('value');
    const bookings = snapshot.val() || {};
    
    const bookingsArray = Object.entries(bookings).map(([id, data]) => ({
      id,
      ...data
    }));

    // Sort by createdAt descending
    bookingsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: bookingsArray });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalTurfs: 0,
      totalBookings: 0,
      totalUsers: 0,
      totalRevenue: 0,
      sportWise: {}
    };

    // Count turfs by sport
    for (const sport of ALLOWED_SPORTS) {
      const snapshot = await db.collection(sport).get();
      const count = snapshot.size;
      stats.sportWise[sport] = count;
      stats.totalTurfs += count;
    }

    // Count bookings (from bookings node)
    const bookingsSnapshot = await realtimeDb.ref('bookings').once('value');
    const bookings = bookingsSnapshot.val() || {};
    stats.totalBookings = Object.keys(bookings).length;

    // Count users
    const listUsersResult = await auth.listUsers();
    stats.totalUsers = listUsersResult.users.length;

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// Make user admin (merges claims instead of overwriting)
router.post('/make-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await auth.getUser(userId);
    const existingClaims = user.customClaims || {};
    await auth.setCustomUserClaims(userId, { ...existingClaims, admin: true });
    
    res.json({ 
      success: true, 
      message: 'User is now an admin' 
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ success: false, error: 'Failed to update admin status' });
  }
});

// Remove admin privileges (merges claims instead of overwriting)
router.post('/remove-admin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await auth.getUser(userId);
    const existingClaims = user.customClaims || {};
    delete existingClaims.admin;
    await auth.setCustomUserClaims(userId, existingClaims);
    
    res.json({ 
      success: true, 
      message: 'Admin privileges removed' 
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ success: false, error: 'Failed to remove admin' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers();
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
      isAdmin: user.customClaims?.admin || false,
      isOwner: user.customClaims?.owner || false
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
