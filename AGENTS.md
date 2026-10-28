## Rules
- Booking price, status transitions and capacity checks are enforced by database triggers (guard_booking), never trusted from the client — prevents tampering and overbooking.
- Center approval status and caregiver verification can only be changed by admins (DB triggers) — keeps the verification workflow trustworthy.
- Center photos are referenced by `image_key` mapped to bundled assets in src/lib/centers.ts — no file uploads yet.
- Database schema lives in supabase/migrations; demo content in supabase/seed.sql.
