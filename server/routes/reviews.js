import express from 'express';
import { db } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';
import { ALLOWED_SPORTS } from '../config/constants.js';

const router = express.Router();

// Get reviews for a turf
router.get('/:sport/:turfId', async (req, res) => {
  try {
    const { sport, turfId } = req.params;

    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }
    
    const snapshot = await db
      .collection('reviews')
      .where('sport', '==', sport)
      .where('turfId', '==', turfId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// Create a review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { sport, turfId, rating, comment } = req.body;

    // Validate all required fields
    if (!sport || !turfId || rating === undefined || !comment) {
      return res.status(400).json({ 
        success: false, 
        error: 'sport, turfId, rating, and comment are required' 
      });
    }
    
    if (!ALLOWED_SPORTS.includes(sport)) {
      return res.status(400).json({ success: false, error: 'Invalid sport' });
    }

    // Validate rating is a number between 1-5
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating must be an integer between 1 and 5' 
      });
    }

    // Sanitize comment (basic XSS prevention)
    const sanitizedComment = comment
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 1000);

    const reviewData = {
      sport,
      turfId,
      userId: req.user.uid,
      userEmail: req.user.email,
      rating: numRating,
      comment: sanitizedComment,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('reviews').add(reviewData);
    
    // Update turf rating
    await updateTurfRating(sport, turfId);

    res.status(201).json({ 
      success: true, 
      data: { id: docRef.id, ...reviewData } 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

// Update turf rating
async function updateTurfRating(sport, turfId) {
  try {
    const snapshot = await db
      .collection('reviews')
      .where('sport', '==', sport)
      .where('turfId', '==', turfId)
      .get();
    
    if (snapshot.empty) return;

    let totalRating = 0;
    let count = 0;

    snapshot.forEach(doc => {
      totalRating += doc.data().rating;
      count++;
    });

    const avgRating = (totalRating / count).toFixed(1);

    await db.collection(sport).doc(turfId).update({
      rating: parseFloat(avgRating),
      totalReviews: count
    });
  } catch (error) {
    console.error('Error updating turf rating:', error);
  }
}

// Delete review
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('reviews').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const reviewData = doc.data();
    
    // Check if user owns the review
    if (reviewData.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('reviews').doc(id).delete();
    
    // Update turf rating
    await updateTurfRating(reviewData.sport, reviewData.turfId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

export default router;
