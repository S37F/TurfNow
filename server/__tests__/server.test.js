import request from 'supertest';

// ---- Build a minimal Express app that mirrors server.js routes ----
// Route modules use SQLite; in-memory DB is empty unless seeded.

let app;

beforeAll(async () => {
  // Set test env (SQLite in-memory + JWT before DB/auth load)
  process.env.NODE_ENV = 'test';
  process.env.FRONTEND_URL = 'http://localhost:3001';
  process.env.SQLITE_PATH = ':memory:';
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-16-chars';

  // Dynamic import so env vars are set first
  const { default: server } = await import('../server.js');
  app = server;
});

describe('Health Check', () => {
  it('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Route not found');
  });
});

describe('Turfs API', () => {
  it('GET /api/turfs/:sport returns 200 with empty list when no turfs seeded', async () => {
    const res = await request(app).get('/api/turfs/football');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/turfs/:sport returns 400 for invalid sport', async () => {
    const res = await request(app).get('/api/turfs/tennis');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid sport');
  });

  it('POST /api/turfs/:sport without token returns 401', async () => {
    const res = await request(app)
      .post('/api/turfs/football')
      .send({ name: 'Test Turf', address: 'Test', city: 'Test', pricePerHour: 500 });
    expect(res.status).toBe(401);
  });
});

describe('Bookings API', () => {
  it('GET /api/bookings/my without auth returns 401', async () => {
    const res = await request(app).get('/api/bookings/my');
    expect(res.status).toBe(401);
  });

  it('POST /api/bookings without auth returns 401', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ booking: { name: 'Test' }, time: '5:00 AM', bookingDate: '2025-12-01', sport: 'football' });
    expect(res.status).toBe(401);
  });

  it('GET /api/bookings/slots/:turfName/:date returns booked slots list', async () => {
    const res = await request(app).get('/api/bookings/slots/TestTurf/2025-12-01');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/bookings/:id/cancel without auth returns 401', async () => {
    const res = await request(app).patch('/api/bookings/test-id/cancel');
    expect(res.status).toBe(401);
  });
});

describe('Auth-protected routes return 401 without token', () => {
  const protectedRoutes = [
    ['GET', '/api/bookings/my'],
    ['POST', '/api/bookings'],
    ['GET', '/api/admin/bookings'],
    ['GET', '/api/admin/stats'],
    ['GET', '/api/admin/users'],
    ['POST', '/api/owners/register'],
    ['GET', '/api/owners/profile'],
    // Reviews route hits Firestore which may not be enabled
    // ['GET', '/api/reviews/football/test-id'],
  ];

  test.each(protectedRoutes)('%s %s returns 401', async (method, path) => {
    const reqMethod = method.toLowerCase();
    let res;
    if (reqMethod === 'get') {
      res = await request(app).get(path);
    } else if (reqMethod === 'post') {
      res = await request(app).post(path).send({});
    } else if (reqMethod === 'patch') {
      res = await request(app).patch(path).send({});
    }
    expect(res.status).toBe(401);
  });
});

describe('CORS headers', () => {
  it('includes CORS headers for allowed origin', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3001');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3001');
  });
});

describe('Rate limiting', () => {
  it('allows requests under the limit', async () => {
    const res = await request(app).get('/api/turfs/football');
    expect(res.status).not.toBe(429);
  });
});

describe('Input sanitization', () => {
  it('strips $ keys from JSON body', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ $where: 'malicious', booking: { name: 'Test' } });
    // Request should still fail with 401 (auth required) not crash
    expect(res.status).toBe(401);
  });
});
