-- TurfNow — SQLite (no Supabase). Loaded automatically on API startup.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  is_owner INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS turfs (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  sport TEXT NOT NULL CHECK (sport IN ('football', 'cricket', 'basketball', 'badminton')),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  price_per_hour REAL NOT NULL,
  facilities TEXT NOT NULL DEFAULT '[]',
  size TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  owner_id TEXT NOT NULL DEFAULT '',
  available INTEGER NOT NULL DEFAULT 1,
  rating REAL NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_turfs_sport ON turfs (sport);
CREATE INDEX IF NOT EXISTS idx_turfs_city ON turfs (city);
CREATE INDEX IF NOT EXISTS idx_turfs_owner_id ON turfs (owner_id);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  sport TEXT NOT NULL,
  turf_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user_email TEXT,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_turf ON reviews (sport, turf_id);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  email TEXT,
  turf_name TEXT NOT NULL,
  turf_image TEXT NOT NULL DEFAULT '',
  turf_address TEXT NOT NULL DEFAULT '',
  turf_price REAL NOT NULL DEFAULT 0,
  sport TEXT NOT NULL,
  time TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  cancelled_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_turf_date ON bookings (turf_name, booking_date);

CREATE TABLE IF NOT EXISTS owner_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  city TEXT NOT NULL,
  sport_types TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  approved_at TEXT,
  approved_by TEXT,
  rejected_at TEXT,
  rejected_by TEXT,
  rejection_reason TEXT,
  turfs TEXT NOT NULL DEFAULT '[]'
);
