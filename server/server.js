import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Import routes
import turfsRouter from './routes/turfs.js';
import bookingsRouter from './routes/bookings.js';
import reviewsRouter from './routes/reviews.js';
import adminRouter from './routes/admin.js';
import ownersRouter from './routes/owners.js';
import { sanitizeInput } from './middleware/sanitize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Validate required env vars
const validateEnv = () => {
  const warnings = [];
  if (!process.env.FRONTEND_URL) warnings.push('FRONTEND_URL not set, defaulting to http://localhost:3001');
  if (isProduction && !process.env.FRONTEND_URL) {
    console.error('❌ FRONTEND_URL must be set in production');
  }
  if (warnings.length) warnings.forEach(w => console.warn(`⚠️  ${w}`));
};
validateEnv();

// Parse allowed origins (supports comma-separated list)
const parseOrigins = () => {
  const raw = process.env.FRONTEND_URL || 'http://localhost:3001';
  const origins = raw.split(',').map(s => s.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 500,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Middleware
// When deployed on Cloud Run behind Firebase Hosting rewrites,
// the API is pure backend — CSP headers are not relevant.
// CSP is only needed when the server also serves the frontend (Docker mode).
const servingFrontend = isProduction && existsSync(join(__dirname, 'public', 'index.html'));
app.use(helmet({
  contentSecurityPolicy: servingFrontend ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: [
        "'self'",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://www.googleapis.com",
        "https://firestore.googleapis.com",
        "https://firebasestorage.googleapis.com",
        "https://firebase.googleapis.com",
        "https://turfnow-7036b-default-rtdb.firebaseio.com",
        "wss://turfnow-7036b-default-rtdb.firebaseio.com",
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://www.google-analytics.com",
        "https://firebase-settings.crashlytics.com",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "wss://*.firebaseio.com"
      ],
      frameSrc: ["'self'", "https://accounts.google.com", "https://apis.google.com", "https://turfnow-7036b.firebaseapp.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  } : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// HTTPS redirect in production (behind a reverse proxy)
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(cors({
  origin: parseOrigins(),
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInput);
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/turfs', turfsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/owners', ownersRouter);

// Serve frontend in production
if (isProduction) {
  // Check multiple possible build paths (Docker puts it in ./public, local dev in ../build)
  const possiblePaths = [
    join(__dirname, 'public'),
    join(__dirname, '..', 'build'),
  ];
  const buildPath = possiblePaths.find(p => existsSync(p));
  if (buildPath) {
    app.use(express.static(buildPath));
    // SPA fallback — serve index.html for non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/health') return next();
      res.sendFile(join(buildPath, 'index.html'));
    });
    console.log(`📂 Serving frontend from: ${buildPath}`);
  }
}

// 404 handler (MUST be before error handler)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handling middleware (MUST be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    error: isProduction ? 'Internal server error' : err.message 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;

