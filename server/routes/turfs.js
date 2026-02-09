import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

// Get all turfs by sport type
router.get('/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { city, available, minPrice, maxPrice } = req.query;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid sport. Allowed: ${ALLOWED_SPORTS.join(', ')}` 
      });
    }

    let query = db.collection(sport);

    // Apply filters
    if (city) {
      query = query.where('city', '==', city);
    }
    if (available !== undefined) {
      const isAvailable = available === 'true' || available === '1';
      query = query.where('available', '==', isAvailable);
    }

    const snapshot = await query.get();
    
    let turfs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by price range (client-side filtering)
    if (minPrice || maxPrice) {
      turfs = turfs.filter(turf => {
        const price = turf.pricePerHour || 0;
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
        return true;
      });
    }

    res.json({ success: true, data: turfs });
  } catch (error) {
    console.error('Error fetching turfs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch turfs' });
  }
});

// Get single turf by ID
router.get('/:sport/:id', async (req, res) => {
  try {
    const { sport, id } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    const doc = await db.collection(sport).doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error fetching turf:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch turf' });
  }
});

// Create new turf (Admin only)
router.post('/:sport', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sport } = req.params;
    const { name, address, city, image, pricePerHour, facilities, size, description, ownerId } = req.body;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }
    if (!name || !address || !city || !pricePerHour) {
      return res.status(400).json({ success: false, error: 'name, address, city, and pricePerHour are required' });
    }

    const turfData = {
      name,
      address,
      city,
      image: image || '',
      pricePerHour: Number(pricePerHour),
      facilities: facilities || [],
      size: size || '',
      description: description || '',
      ownerId: ownerId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      available: true,
      rating: 0,
      totalReviews: 0
    };

    const docRef = await db.collection(sport).add(turfData);
    
    res.status(201).json({ 
      success: true, 
      data: { id: docRef.id, ...turfData } 
    });
  } catch (error) {
    console.error('Error creating turf:', error);
    res.status(500).json({ success: false, error: 'Failed to create turf' });
  }
});

// Update turf (Admin only)
router.put('/:sport/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sport, id } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    // Only allow specific fields to be updated
    const allowedFields = ['name', 'address', 'city', 'image', 'pricePerHour', 'facilities', 'size', 'description', 'available', 'ownerId'];
    const updateData = { updatedAt: new Date().toISOString() };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await db.collection(sport).doc(id).update(updateData);
    
    res.json({ 
      success: true, 
      message: 'Turf updated successfully',
      data: { id, ...updateData }
    });
  } catch (error) {
    console.error('Error updating turf:', error);
    res.status(500).json({ success: false, error: 'Failed to update turf' });
  }
});

// Delete turf (Admin only)
router.delete('/:sport/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { sport, id } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    await db.collection(sport).doc(id).delete();
    
    res.json({ success: true, message: 'Turf deleted successfully' });
  } catch (error) {
    console.error('Error deleting turf:', error);
    res.status(500).json({ success: false, error: 'Failed to delete turf' });
  }
});

export default router;
