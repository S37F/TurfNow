import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NODE_ENV !== 'test') {
  throw new Error('DATABASE_URL is required (Neon/Postgres connection string).');
}

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
      }
    : undefined
);

export async function query(text, params = []) {
  if (!connectionString && process.env.NODE_ENV === 'test') {
    return { rows: [], rowCount: 0 };
  }
  return pool.query(text, params);
}

export { pool };
