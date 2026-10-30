## Rules
- Booking price, status transitions and capacity checks are enforced by database triggers (guard_booking), never trusted from the client — prevents tampering and overbooking.
- Center approval status and caregiver verification can only be changed by admins (DB triggers) — keeps the verification workflow trustworthy.
- Center photos: providers upload to the public `center-photos` storage bucket under `<center_id>/`; `centers.photo_path` must point inside that folder (DB check + storage policies). Centers without a photo fall back to bundled samples via `image_key` (`photoFor()` in src/lib/centers.ts).
- Database schema lives in supabase/migrations; demo content in supabase/seed.sql.
