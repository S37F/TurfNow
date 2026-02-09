/**
 * Input sanitization middleware
 * Prevents XSS, NoSQL injection, and other input-based attacks
 */

// HTML entity escaping for strings
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Recursively sanitize object values
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove null bytes
    let cleaned = value.replace(/\0/g, '');
    // Escape HTML entities
    cleaned = escapeHtml(cleaned);
    // Trim whitespace
    cleaned = cleaned.trim();
    return cleaned;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Remove keys starting with $ (NoSQL injection prevention)
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
};

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

/**
 * Validate that required fields are present and non-empty
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (field = 'email') => {
  return (req, res, next) => {
    const email = req.body[field];
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    next();
  };
};
