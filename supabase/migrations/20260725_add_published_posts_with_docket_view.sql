create or replace view published_posts_with_docket as
select
  id,
  title,
  slug,
  section,
  dek,
  body_html,
  cover_image_url,
  cover_image_position,
  location,
  author,
  status,
  published_at,
  reading_time_minutes,
  created_at,
  updated_at,
  'No. ' || lpad(
    row_number() over (order by published_at asc)::text, 3, '0'
  ) as docket_no
from posts
where status = 'published';

grant select on published_posts_with_docket to anon, authenticated;
