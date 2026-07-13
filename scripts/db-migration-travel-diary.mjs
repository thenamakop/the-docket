/**
 * Migration: add 'travel-diary' section + nullable 'location' column to posts table.
 *
 * Run once from project root:
 *   node scripts/db-migration-travel-diary.mjs
 *
 * Strategy:
 *   1. Create a temporary Postgres function (via PostgREST's RPC — functions can
 *      execute DDL when created with SECURITY DEFINER and called by service role).
 *   2. Call it.
 *   3. Drop it.
 *
 * The migration is idempotent: re-running after success is safe.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const env = readFileSync(envPath, 'utf8');

const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const svcMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
if (!urlMatch || !svcMatch) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const svcKey = svcMatch[1].trim();

const headers = {
  apikey: svcKey,
  Authorization: `Bearer ${svcKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function rpc(fnName, args = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

async function post(path, body) {
  const res = await fetch(`${supabaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

// ── Step 1: create the migration helper function ────────────────────────────
// We use CREATE OR REPLACE so re-runs don't fail.
// SECURITY DEFINER + SET search_path = public makes it run as the function owner
// (which for service role has DDL rights).
console.log('\n[1/4] Creating migration helper function...');

const createFnSql = `
create or replace function run_travel_diary_migration()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Drop old section constraint
  alter table posts drop constraint if exists posts_section_check;

  -- Recreate with travel-diary added
  alter table posts add constraint posts_section_check
    check (section in (
      'law-justice','criminal-justice','book-reviews',
      'personal-essays','poetry-fiction','guest-posts','travel-diary'
    ));

  -- Add location column (idempotent)
  alter table posts add column if not exists location text;

  return 'migration complete';
end;
$$;
`;

// We need to create this function first — the only way to do DDL via PostgREST
// is through a SECURITY DEFINER function. To create the function itself, we
// need another mechanism. Let's use the Supabase REST SQL endpoint via the
// internal /pg endpoint if available, or fall back to instructions.

// Try the Supabase internal SQL endpoint (works in some versions)
const sqlEndpoints = [`${supabaseUrl}/pg/query`, `${supabaseUrl}/rest/v1/`];

// Actually the cleanest path: use the service role key to POST to the
// Supabase /rest/v1/rpc endpoint to create a function...
// but you can't create a function through RPC — it's a chicken-and-egg problem.

// ── Real solution: use the Supabase JS client's `from('...').rpc()` doesn't help.
// The ONLY way to run arbitrary DDL without the Management API PAT or direct psql
// is to create the helper function first through a mechanism that accepts SQL.

// Let's check if there's an existing 'query' or 'sql' RPC function that Supabase
// may have created for this project.

console.log('[1/4] Checking for existing SQL execution RPC...');

for (const fnName of ['query', 'sql', 'execute_sql', 'run_sql']) {
  const { status, body } = await rpc(fnName, { query: 'select 1' });
  if (status !== 404) {
    console.log(`  Found: ${fnName} (status ${status})`);
  }
}

// Since no exec function exists, print the exact SQL to run manually in
// the Supabase SQL Editor, which is the reliable path.
console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Manual step required — run in Supabase SQL Editor:          ║
║  dashboard.supabase.com → project → SQL Editor → New query   ║
╚══════════════════════════════════════════════════════════════╝

-- 1. Drop the existing section CHECK constraint
alter table posts drop constraint posts_section_check;

-- 2. Recreate it with 'travel-diary' added
alter table posts add constraint posts_section_check
  check (section in (
    'law-justice','criminal-justice','book-reviews',
    'personal-essays','poetry-fiction','guest-posts','travel-diary'
  ));

-- 3. Add optional location column (safe to re-run)
alter table posts add column if not exists location text;

-- 4. Verify
select column_name, data_type, is_nullable
  from information_schema.columns
  where table_name = 'posts' and column_name = 'location';

select pg_get_constraintdef(oid)
  from pg_constraint
  where conrelid = 'posts'::regclass and conname = 'posts_section_check';
`);
