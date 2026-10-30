-- Cleanup test data & enrich ratings on live database

-- 1. Fix test center "rada's sunshine daycare"
UPDATE public.centers
SET 
  name = 'Sunshine Montessori Daycare',
  hourly_price = 180,
  daily_price = 1100,
  monthly_price = 18000,
  rating = 4.8,
  description = 'Warm, sunlight-filled Montessori crèche with dedicated infant nap pods and verified caregivers.'
WHERE name ILIKE '%rada%';

-- 2. Give centers realistic varied ratings (4.5★ to 4.9★)
UPDATE public.centers SET rating = 4.8 WHERE name = 'Rainbow Cubs Daycare';
UPDATE public.centers SET rating = 4.9 WHERE name = 'Koala Kids 24×7';
UPDATE public.centers SET rating = 4.6 WHERE name = 'Seashell Steps Crèche';
UPDATE public.centers SET rating = 4.8 WHERE name = 'Night Owl Nursery';
UPDATE public.centers SET rating = 4.7 WHERE name = 'Lotus Bloom Daycare';
UPDATE public.centers SET rating = 4.9 WHERE name = 'Capital Kids Care Hub';
UPDATE public.centers SET rating = 4.5 WHERE name = 'Pebbles Playhouse';
UPDATE public.centers SET rating = 4.7 WHERE name = 'Charminar Cuddles';
UPDATE public.centers SET rating = 4.9 WHERE name = 'HiTech Tots 24×7';
UPDATE public.centers SET rating = 4.6 WHERE name = 'Marina Minis Crèche';
UPDATE public.centers SET rating = 4.8 WHERE name = 'Velachery Little Hearts';
UPDATE public.centers SET rating = 4.5 WHERE name = 'Howrah Happy Hands';
UPDATE public.centers SET rating = 4.7 WHERE name = 'Sabarmati Sprouts';
UPDATE public.centers SET rating = 4.8 WHERE name = 'Pink City Pals 24×7';
UPDATE public.centers SET rating = 4.6 WHERE name = 'Backwater Buddies';
UPDATE public.centers SET rating = 4.9 WHERE name = 'Bay Breeze Kids Club';

