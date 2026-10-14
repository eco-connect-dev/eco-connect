alter table public.community_posts
  add column if not exists image_url text;

alter table public.dumping_reports
  add column if not exists image_url text;

-- The app stores and displays durable public URLs in each row.
update storage.buckets
set public = true
where id in ('community_posts', 'dump-report-images');

drop policy if exists "Authenticated users upload community and dumping images"
  on storage.objects;
create policy "Authenticated users upload community and dumping images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('community_posts', 'dump-report-images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
