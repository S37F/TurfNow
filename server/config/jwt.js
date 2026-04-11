export function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a strong value (at least 16 characters) in production');
  }
  return 'turfnow-dev-only-jwt-secret-change-me';
}
