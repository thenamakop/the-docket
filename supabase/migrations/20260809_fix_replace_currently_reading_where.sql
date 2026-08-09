-- pg-safeupdate rejects unqualified DELETE statements, including inside functions.
-- Recreate the replace function with a WHERE clause so the cron RPC succeeds.
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
