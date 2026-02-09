import express from 'express';
import { db, realtimeDb, auth } from '../config/firebase.js';
import { verifyToken, isAdmin, isOwner } from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../services/email.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

// Register as turf owner (requires authentication)
router.post('/register', verifyToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;
    const { 
      fullName, phone, businessName, 
      businessAddress, city, sportTypes, description 
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !businessName || !businessAddress || !city) {
      return res.status(400).json({ 
        success: false, 
        error: 'All required fields must be provided: fullName, phone, businessName, businessAddress, city' 
      });
    }

    // Basic phone validation
    if (!/^[\d\s+\-()]{7,15}$/.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    // Check if owner already registered
    const existingOwner = await realtimeDb.ref(`owners/${uid}`).get();
    if (existingOwner.exists()) {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already registered as a turf owner' 
      });
    }

    // Create owner record with pending status (status set server-side only)
    const ownerData = {
      uid,
      email,
      fullName,
      phone,
      businessName,
      businessAddress,
      city,
      sportTypes: sportTypes || [],
      description: description || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      turfs: [],
    };

    await realtimeDb.ref(`owners/${uid}`).set(ownerData);

    // Send confirmation email to owner
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
      data: { uid, status: 'pending' }
    });
  } catch (error) {
    console.error('Error registering owner:', error);
    res.status(500).json({ success: false, error: 'Failed to register' });
  }
});

// Get owner profile (owner only - authenticated)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const snapshot = await realtimeDb.ref(`owners/${req.user.uid}`).get();
    
    if (!snapshot.exists()) {
      return res.status(404).json({ 
        success: false, 
        error: 'Owner profile not found' 
      });
    }

    res.json({ success: true, data: snapshot.val() });
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Update owner profile (owner only)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, phone, businessName, businessAddress, city, description } = req.body;
    
    const updates = {
      updatedAt: new Date().toISOString()
    };

    // Only include provided fields
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (businessName) updates.businessName = businessName;
    if (businessAddress) updates.businessAddress = businessAddress;
    if (city) updates.city = city;
    if (description !== undefined) updates.description = description;

    await realtimeDb.ref(`owners/${req.user.uid}`).update(updates);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating owner profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ===== ADMIN ROUTES =====

// Get all owner registrations (admin only)
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const snapshot = await realtimeDb.ref('owners').get();
    const owners = [];
    
    snapshot.forEach(child => {
      const owner = { id: child.key, ...child.val() };
      if (!status || owner.status === status) {
        owners.push(owner);
      }
    });

    owners.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: owners });
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch owners' });
  }
});

// Approve owner registration (admin only — merges claims)
router.post('/:ownerId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const snapshot = await realtimeDb.ref(`owners/${ownerId}`).get();
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Owner not found' });
    }

    const owner = snapshot.val();
    
    // Update owner status
    await realtimeDb.ref(`owners/${ownerId}`).update({
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: req.user.uid
    });

    // Merge custom claim (don't overwrite existing claims)
    const user = await auth.getUser(ownerId);
    const existingClaims = user.customClaims || {};
    await auth.setCustomUserClaims(ownerId, { ...existingClaims, owner: true });

    // Send approval email
    try {
      await sendEmail(
        owner.email,
        'TurfNow - Your Owner Account is Approved! 🎉',
        emailTemplates.ownerApproved({ fullName: owner.fullName, businessName: owner.businessName })
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError.message);
    }

    res.json({ 
      success: true, 
      message: 'Owner approved successfully' 
    });
  } catch (error) {
    console.error('Error approving owner:', error);
    res.status(500).json({ success: false, error: 'Failed to approve owner' });
  }
});

// Reject owner registration (admin only)
router.post('/:ownerId/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { reason } = req.body;
    
    const snapshot = await realtimeDb.ref(`owners/${ownerId}`).get();
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Owner not found' });
    }

    const owner = snapshot.val();
    
    // Update owner status
    await realtimeDb.ref(`owners/${ownerId}`).update({
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: req.user.uid,
      rejectionReason: reason || 'Application did not meet requirements'
    });

    // Send rejection email
    try {
      await sendEmail(
        owner.email,
        'TurfNow - Owner Application Update',
        emailTemplates.ownerRejected({ 
          fullName: owner.fullName, 
          reason: reason || 'Application did not meet requirements' 
        })
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError.message);
    }

    res.json({ 
      success: true, 
      message: 'Owner rejected' 
    });
  } catch (error) {
    console.error('Error rejecting owner:', error);
    res.status(500).json({ success: false, error: 'Failed to reject owner' });
  }
});

// Get owner's turfs (owner only)
router.get('/my-turfs', verifyToken, async (req, res) => {
  try {
    const ownerSnapshot = await realtimeDb.ref(`owners/${req.user.uid}`).get();
    
    if (!ownerSnapshot.exists()) {
      return res.status(404).json({ success: false, error: 'Owner profile not found' });
    }

    const owner = ownerSnapshot.val();
    
    if (owner.status !== 'approved') {
      return res.status(403).json({ 
        success: false, 
        error: 'Your owner account is not approved yet' 
      });
    }

    // Get all turfs owned by this user
    const turfs = [];
    
    for (const sport of ALLOWED_SPORTS) {
      const snapshot = await db.collection(sport).where('ownerId', '==', req.user.uid).get();
      snapshot.docs.forEach(doc => {
        turfs.push({ id: doc.id, sport, ...doc.data() });
      });
    }

    res.json({ success: true, data: turfs });
  } catch (error) {
    console.error('Error fetching owner turfs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch turfs' });
  }
});

// Get owner's bookings (owner only) — uses new bookings node
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    // Get all turfs owned by this user first
    const turfNames = [];
    
    for (const sport of ALLOWED_SPORTS) {
      const snapshot = await db.collection(sport).where('ownerId', '==', req.user.uid).get();
      snapshot.docs.forEach(doc => {
        turfNames.push(doc.data().name);
      });
    }

    // Get all bookings for these turfs
    const bookingsSnapshot = await realtimeDb.ref('bookings').once('value');
    const allBookings = bookingsSnapshot.val() || {};
    const bookings = [];
    
    Object.entries(allBookings).forEach(([id, booking]) => {
      if (turfNames.includes(booking.turfName)) {
        bookings.push({ id, ...booking });
      }
    });

    // Sort by date descending
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

export default router;
