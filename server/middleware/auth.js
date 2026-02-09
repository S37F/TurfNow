import { auth } from '../config/firebase.js';

// Verify Firebase ID token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is admin (uses custom claims from decoded token first, falls back to getUser)
export const isAdmin = async (req, res, next) => {
  try {
    // First check decoded token claims (fast path)
    if (req.user?.admin === true) {
      return next();
    }

    // Fallback: fetch from Firebase Auth (in case token was issued before claim was set)
    const user = await auth.getUser(req.user.uid);
    if (user.customClaims?.admin === true) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Admin only.' });
  } catch (error) {
    console.error('Error checking admin status:', error.message);
    res.status(500).json({ error: 'Error verifying admin status' });
  }
};

// Check if user is an approved turf owner
export const isOwner = async (req, res, next) => {
  try {
    // First check decoded token claims
    if (req.user?.owner === true) {
      return next();
    }

    // Fallback: fetch from Firebase Auth
    const user = await auth.getUser(req.user.uid);
    if (user.customClaims?.owner === true) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Approved turf owners only.' });
  } catch (error) {
    console.error('Error checking owner status:', error.message);
    res.status(500).json({ error: 'Error verifying owner status' });
  }
};
