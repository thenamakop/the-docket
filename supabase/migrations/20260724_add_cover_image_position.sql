alter table posts
  add column if not exists cover_image_position text
  default 'center'
  check (cover_image_position in ('top', 'center', 'bottom'));
