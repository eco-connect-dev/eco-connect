alter table public.community_posts
  alter column description drop not null,
  alter column image_url drop not null;

alter table public.community_posts
  drop constraint if exists community_posts_description_check;

alter table public.community_posts
  add constraint community_posts_description_check
  check (
    description is null
    or char_length(btrim(description)) between 1 and 4000
  );
