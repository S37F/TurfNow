import { jest } from '@jest/globals';
import { sanitizeInput, validateRequired, validateEmail } from '../middleware/sanitize.js';

describe('sanitizeInput middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {};
    next = jest.fn();
  });

  it('calls next when body is clean', () => {
    req.body = { name: 'John', email: 'john@example.com' };
    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('strips $ keys from body (NoSQL injection prevention)', () => {
    req.body = { name: 'John', $gt: 'malicious', nested: { $where: 'hack' } };
    sanitizeInput(req, res, next);
    expect(req.body.$gt).toBeUndefined();
    expect(req.body.nested.$where).toBeUndefined();
    expect(req.body.name).toBe('John');
    expect(next).toHaveBeenCalled();
  });

  it('strips < and > from string values (XSS prevention)', () => {
    req.body = { name: '<script>alert("xss")</script>' };
    sanitizeInput(req, res, next);
    expect(req.body.name).not.toContain('<script>');
    expect(next).toHaveBeenCalled();
  });

  it('removes null bytes from strings', () => {
    req.body = { name: 'John\0Doe' };
    sanitizeInput(req, res, next);
    expect(req.body.name).toBe('JohnDoe');
    expect(next).toHaveBeenCalled();
  });

  it('handles empty body gracefully', () => {
    req.body = {};
    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('handles null body gracefully', () => {
    req.body = null;
    sanitizeInput(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('sanitizes query params', () => {
    req.query = { search: '<script>alert(1)</script>' };
    sanitizeInput(req, res, next);
    expect(req.query.search).not.toContain('<script>');
    expect(next).toHaveBeenCalled();
  });
});

describe('validateRequired (middleware factory)', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('calls next when all fields present', () => {
    req.body = { name: 'John', email: 'john@test.com' };
    const middleware = validateRequired(['name', 'email']);
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 when fields are missing', () => {
    req.body = { name: 'John' };
    const middleware = validateRequired(['name', 'email', 'phone']);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('catches empty string as missing', () => {
    req.body = { name: '' };
    const middleware = validateRequired(['name']);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('validateEmail (middleware factory)', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('calls next for valid email', () => {
    req.body = { email: 'test@example.com' };
    const middleware = validateEmail();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for invalid email', () => {
    req.body = { email: 'notanemail' };
    const middleware = validateEmail();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when email field is absent', () => {
    req.body = {};
    const middleware = validateEmail();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
