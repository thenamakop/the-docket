import { Client } from 'pg';

const client = new Client({
  connectionString:
    'postgresql://postgres:SHIKAIaizen129@db.raqzvvfnqlwtoilpwovr.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  on conflict (id) do nothing;
`);

await client.query(`
  create policy "Authenticated users can upload post images"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'post-images');
`);

await client.query(`
  create policy "Anyone can view post images"
    on storage.objects for select to anon
    using (bucket_id = 'post-images');
`);

await client.query(`
  create policy "Authenticated users can delete post images"
    on storage.objects for delete to authenticated
    using (bucket_id = 'post-images');
`);

const { rows } = await client.query(
  "select id, name, public from storage.buckets where id = 'post-images';"
);
console.log('Buckets:', rows);

await client.end();
