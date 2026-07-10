import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'competitor_tracker',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || '',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : false,
});

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function initSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tracked_pages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      check_interval_hours INTEGER DEFAULT 24,
      screenshot_enabled BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_checked_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id SERIAL PRIMARY KEY,
      tracked_page_id INTEGER NOT NULL REFERENCES tracked_pages(id) ON DELETE CASCADE,
      s3_key TEXT NOT NULL,
      screenshot_s3_key TEXT,
      text_hash VARCHAR(64) NOT NULL,
      fetched_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS changes (
      id SERIAL PRIMARY KEY,
      tracked_page_id INTEGER NOT NULL REFERENCES tracked_pages(id) ON DELETE CASCADE,
      old_snapshot_id INTEGER REFERENCES snapshots(id),
      new_snapshot_id INTEGER NOT NULL REFERENCES snapshots(id),
      added_lines_count INTEGER DEFAULT 0,
      removed_lines_count INTEGER DEFAULT 0,
      diff_summary TEXT,
      detected_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Add columns if they don't exist (safe for existing databases)
  await query(`
    ALTER TABLE tracked_pages ADD COLUMN IF NOT EXISTS screenshot_enabled BOOLEAN DEFAULT false;
  `).catch(() => {});

  await query(`
    ALTER TABLE snapshots ADD COLUMN IF NOT EXISTS screenshot_s3_key TEXT;
  `).catch(() => {});
}
