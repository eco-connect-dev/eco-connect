-- Optional demo records for the resident Track tab.
-- Run in the Supabase SQL Editor after creating both tables.
insert into public.dumping_reports
  (id, reporter_id, category, status, submitted_at, location, notes)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '3fb71c03-3d22-4257-913f-f96b5784d9e4',
    'Illegal dumping',
    'in_review',
    now() - interval '2 days',
    '12 Flower Lane, Borella',
    'Several bags of mixed waste left beside the road.'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '3fb71c03-3d22-4257-913f-f96b5784d9e4',
    'Construction debris',
    'pending',
    now() - interval '5 hours',
    '45 Park Road, Colombo 05',
    'Rubble has been left on the roadside.'
  )
on conflict (id) do nothing;

insert into public.pickup_requests
  (id, resident_id, category, status, submitted_at, location, notes)
values
  (
    '33333333-3333-4333-8333-333333333333',
    '3fb71c03-3d22-4257-913f-f96b5784d9e4',
    'Bulk waste',
    'assigned',
    now() - interval '1 day',
    '12 Flower Lane, Borella',
    'Old sofa and dining table for collection.'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '3fb71c03-3d22-4257-913f-f96b5784d9e4',
    'Recyclable waste',
    'pending',
    now() - interval '3 hours',
    '45 Park Road, Colombo 05',
    'Cardboard and plastic recyclables.'
  )
on conflict (id) do nothing;
