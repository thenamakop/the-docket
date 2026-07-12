/**
 * Deletes the 8 placeholder seed posts (No. 001 – No. 008) from the Supabase
 * posts table. Requires a service-role key to bypass RLS.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/delete-seed-posts.mjs
 *
 * The key is found at: Supabase dashboard → Project Settings → API →
 * "service_role" (secret) key. Do NOT commit it to the repo.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local to get the project URL
const envPath = resolve(process.cwd(), '.env.local');
let envContents = '';
try {
  envContents = readFileSync(envPath, 'utf8');
} catch {
  console.error('Could not read .env.local — make sure you run this from the project root.');
  process.exit(1);
}

const urlMatch = envContents.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
if (!urlMatch) {
  console.error('NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}
const supabaseUrl = urlMatch[1].trim();

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
    'Get it from: Supabase dashboard → Project Settings → API → service_role (secret)\n' +
    'Then run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/delete-seed-posts.mjs'
  );
  process.exit(1);
}

const seedDocketNos = [
  'No. 001', 'No. 002', 'No. 003', 'No. 004',
  'No. 005', 'No. 006', 'No. 007', 'No. 008',
];

// Build a PostgREST `in` filter: docket_no=in.("No. 001","No. 002",...)
const inFilter = seedDocketNos.map((n) => `"${n}"`).join(',');
const endpoint = `${supabaseUrl}/rest/v1/posts?docket_no=in.(${inFilter})`;

console.log(`Connecting to: ${supabaseUrl}`);
console.log(`Deleting seed posts: ${seedDocketNos.join(', ')}`);

const res = await fetch(endpoint, {
  method: 'DELETE',
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Prefer: 'return=representation',
    'Content-Type': 'application/json',
  },
});

const body = await res.text();

if (!res.ok) {
  console.error(`DELETE failed (HTTP ${res.status}):`, body);
  process.exit(1);
}

let deleted;
try {
  deleted = JSON.parse(body);
} catch {
  deleted = [];
}

if (deleted.length === 0) {
  console.log('No matching rows found — the table may already be empty, or the docket numbers have changed.');
} else {
  console.log(`Deleted ${deleted.length} row(s):`);
  deleted.forEach((row) => console.log(`  • ${row.docket_no} — ${row.title}`));
}
