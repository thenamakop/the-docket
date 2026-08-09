-- Currently-reading books synced from Goodreads RSS.
-- The cron route atomically replaces the table contents on a successful fetch.
-- On fetch/parse failure, or if the feed is empty, the last-known-good rows are preserved.
create table if not exists currently_reading (
  id            uuid primary key default gen_random_uuid(),
  goodreads_id  text not null unique,
  title         text not null,
  author        text,
  cover_url     text,
  book_url      text,
  position      int not null default 0,
  fetched_at    timestamptz not null default now()
);

alter table currently_reading enable row level security;

drop policy if exists "public can read currently reading" on currently_reading;
create policy "public can read currently reading"
  on currently_reading for select using (true);

-- Atomic replace used by the Goodreads cron route.
-- Security definer lets the service role perform the delete + insert as one transaction.
create or replace function replace_currently_reading(books jsonb)
returns void
language plpgsql
security definer
as $$
begin
  delete from currently_reading where goodreads_id is not null;
  insert into currently_reading (goodreads_id, title, author, cover_url, book_url, position)
  select
    b->>'goodreads_id',
    b->>'title',
    b->>'author',
    b->>'cover_url',
    b->>'book_url',
    (b->>'position')::int
  from jsonb_array_elements(books) as b;
end;
$$;
