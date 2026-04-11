import pg from 'pg';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ FATAL: DATABASE_URL is required in production.');
      process.exit(1);
    }
    return null;
  }
  pool = new Pool({
    connectionString: url,
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 20,
  });
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error('Database not configured (DATABASE_URL missing)');
  return p.query(text, params);
}
