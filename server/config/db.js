import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let dbInstance = null;

function openDatabase() {
  if (dbInstance) return dbInstance;
  const path =
    process.env.SQLITE_PATH ||
    join(process.cwd(), 'data', 'turfnow.db');
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  dbInstance = new DatabaseSync(path);
  const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
  dbInstance.exec(readFileSync(schemaPath, 'utf8'));
  return dbInstance;
}

function getDb() {
  return openDatabase();
}

/** Convert Postgres-style $1 placeholders and casts to SQLite ? placeholders. */
function toSqlite(sql, params) {
  let text = sql
    .replace(/::uuid/gi, '')
    .replace(/::jsonb/gi, '')
    .replace(/::timestamptz/gi, '')
    .replace(/::numeric/gi, '')
    .replace(/::int/gi, '')
    .replace(/COUNT\(\*\)\s*::\s*int/gi, 'COUNT(*)');

  const nums = [...text.matchAll(/\$(\d+)/g)].map((m) => parseInt(m[1], 10));
  const unique = [...new Set(nums)].sort((a, b) => b - a);
  for (const n of unique) {
    text = text.replace(new RegExp(`\\$${n}(?!\\d)`, 'g'), '?');
  }

  const args = (params || []).map((p) => {
    if (p === true) return 1;
    if (p === false) return 0;
    return p;
  });

  return { text, args };
}

/**
 * Run a query written for Postgres ($1, $2, RETURNING). Translates for SQLite.
 */
export async function query(text, params = []) {
  const db = getDb();
  const { text: sql, args } = toSqlite(text, params);

  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...args);
    return { rows, rowCount: rows.length };
  }

  if (/RETURNING/i.test(sql)) {
    const stmt = db.prepare(sql);
    const row = stmt.get(...args);
    return {
      rows: row ? [row] : [],
      rowCount: row ? 1 : 0,
    };
  }

  const stmt = db.prepare(sql);
  const info = stmt.run(...args);
  return { rows: [], rowCount: info?.changes ?? 0 };
}

export { getDb };
