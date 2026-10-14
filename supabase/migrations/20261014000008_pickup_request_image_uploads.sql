alter table public.pickup_requests
  add column if not exists image_url text;

-- Pickup request photos are served by public URL like the existing report and
-- community photos.
update storage.buckets
set public = true
where id = 'pickup_requests';

drop policy if exists "Authenticated users upload community and dumping images"
  on storage.objects;
create policy "Authenticated users upload community dumping and pickup images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('community_posts', 'dump-report-images', 'pickup_requests')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
