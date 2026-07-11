import { Client } from 'pg';

const client = new Client({
  connectionString:
    'postgresql://postgres:SHIKAIaizen129@db.raqzvvfnqlwtoilpwovr.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const users = await client.query(
  `select column_name, data_type from information_schema.columns where table_schema = 'auth' and table_name = 'users' order by ordinal_position;`
);
console.log('auth.users columns:', users.rows);

const identities = await client.query(
  `select column_name, data_type from information_schema.columns where table_schema = 'auth' and table_name = 'identities' order by ordinal_position;`
);
console.log('auth.identities columns:', identities.rows);

await client.end();
