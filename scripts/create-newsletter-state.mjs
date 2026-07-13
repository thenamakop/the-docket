/**
 * Creates the newsletter_state table in Supabase via direct Postgres connection.
 * Run once from the project root:
 *   node scripts/create-newsletter-state.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Safe to re-run: uses CREATE TABLE IF NOT EXISTS + INSERT ... ON CONFLICT DO NOTHING.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const envPath = resolve(process.cwd(), '.env.local');
const env = readFileSync(envPath, 'utf8');

const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const svcMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

if (!urlMatch || !svcMatch) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  );
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const svcKey = svcMatch[1].trim();

// Derive the project ref from the Supabase URL
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

// Supabase direct Postgres connection (port 5432, database postgres)
// Password is the service role key JWT
const client = new pg.Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: svcKey,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected to Postgres.');

  await client.query(`
    create table if not exists newsletter_state (
      id                  int primary key default 1,
      last_notified_at    timestamptz not null default now(),
      constraint newsletter_state_singleton check (id = 1)
    );
  `);
  console.log('newsletter_state table created (or already existed).');

  await client.query(`alter table newsletter_state enable row level security;`);
  console.log('RLS enabled.');

  await client.query(`
    insert into newsletter_state (id, last_notified_at)
      values (1, now())
      on conflict (id) do nothing;
  `);
  console.log('Seed row inserted (or already existed).');

  // Verify
  const { rows } = await client.query(
    'select id, last_notified_at from newsletter_state;'
  );
  console.log('Current state:', rows[0]);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
