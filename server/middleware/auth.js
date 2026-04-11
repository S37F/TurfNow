import { getSupabaseAdmin } from '../config/supabaseAdmin.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const appMeta = user.app_metadata || {};
    req.user = {
      sub: user.id,
      uid: user.id,
      id: user.id,
      email: user.email,
      admin: appMeta.admin === true,
      owner: appMeta.owner === true,
    };
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user?.admin === true) {
      return next();
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const { data: { user }, error } = await supabase.auth.admin.getUserById(req.user.uid);
    if (error || !user) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    if (user.app_metadata?.admin === true) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Admin only.' });
  } catch (error) {
    console.error('Error checking admin status:', error.message);
    res.status(500).json({ error: 'Error verifying admin status' });
  }
};

export const isOwner = async (req, res, next) => {
  try {
    if (req.user?.owner === true) {
      return next();
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const { data: { user }, error } = await supabase.auth.admin.getUserById(req.user.uid);
    if (error || !user) {
      return res.status(403).json({ error: 'Access denied. Approved turf owners only.' });
    }

    if (user.app_metadata?.owner === true) {
      return next();
    }

    res.status(403).json({ error: 'Access denied. Approved turf owners only.' });
  } catch (error) {
    console.error('Error checking owner status:', error.message);
    res.status(500).json({ error: 'Error verifying owner status' });
  }
};
