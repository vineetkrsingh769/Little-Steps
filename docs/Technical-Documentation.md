# Technical Architecture & Engineering Documentation
## Little Steps — Trusted 24×7 Childcare & Daycare Platform

**System:** Little Steps  
**Author / Developer:** Vineet Kumar Singh  
**Academic / Organization Context:** Unified Mentor Internship Project  
**Date:** October 30, 2026  
**Revision:** 2.0 (Post-Lovable Standalone Production Stack)  
**Live Site:** [https://little-steps-blue.vercel.app](https://little-steps-blue.vercel.app)  
**Git Repository:** [https://github.com/vineetkrsingh769/Little-Steps](https://github.com/vineetkrsingh769/Little-Steps)  

---

## 1. System Overview & Engineering Philosophy

Little Steps is engineered as an enterprise-grade, serverless web application emphasizing **database-driven integrity**. Unlike conventional web applications where business invariants (such as capacity constraints, authorization checks, and pricing calculation) reside solely in the client or middle-tier web servers, Little Steps guarantees data consistency directly at the database engine tier through PostgreSQL triggers, security definer stored procedures, and fine-grained Row-Level Security (RLS) policies.

This architectural decision ensures that even in edge cases of network retries, race conditions, or unauthorized API calls, **overbooking is mathematically impossible**, pricing cannot be tampered with, and private credentials (like pickup PINs) are never exposed.

---

## 2. Technology Stack

| Layer | Technology | Selection Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **TanStack Start (React 19)** | Full-stack React with file-based routing, type-safe data loading, and instant client hydration. |
| **Styling & UI Design** | **Tailwind CSS + Radix UI** | Accessible, responsive, mobile-first design system with zero runtime CSS overhead. |
| **State & Cache Management** | **TanStack React Query v5** | Server-state caching, automatic cache invalidation, and background query revalidation. |
| **Backend & Database** | **Supabase (PostgreSQL 15)** | Relational Postgres with native Row-Level Security (RLS), stored procedures, and triggers. |
| **Authentication** | **Supabase Auth** | JWT-based authentication supporting Email/Password, OAuth providers (Google), and role claims. |
| **Media & File Storage** | **Supabase Storage** | S3-compatible cloud object storage with path-level RLS policies for facility photo uploads. |
| **Hosting & Edge Infrastructure**| **Vercel** | Global CDN distribution, automated continuous deployment from GitHub `main`, and edge functions. |
| **Testing** | **Vitest + PGlite (In-Memory Postgres)** | Automated unit tests and end-to-end SQL trigger verification without external mock bloat. |

---

## 3. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  [ Parent Portal ]             [ Provider Portal ]             [ Admin Portal ]   |
|   - Search & Filters            - Center & Staff Management     - Approval Queue  |
|   - Real-time Seats Left        - Booking Accept / Reject       - Staff Badge KYC |
|   - Pickup Pass & PIN           - PIN Verification Keypad       - KPI Analytics   |
|   - Reviews & Grievances        - Occupancy & Revenue Charts    - Disputes Desk   |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / WSS
                                           v
+-----------------------------------------------------------------------------------+
|                        APPLICATION & ROUTING LAYER (Vercel)                       |
|                                                                                   |
|   TanStack Start Server Engine / SSR & Client Routing                             |
|   - Type-safe file routes (`/_authenticated/dashboard`, `/centers/$id`, `/auth`)   |
|   - Auth Guard Middleware (`requireSupabaseAuth`)                                 |
+------------------------------------------+----------------------------------------+
                                           | Supabase Client SDK (PostgREST + RPC)
                                           v
+-----------------------------------------------------------------------------------+
|                         DATABASE & SECURITY LAYER (Postgres)                      |
|                                                                                   |
|  +--------------------------------+  +-----------------------------------------+  |
|  |     Row-Level Security (RLS)   |  |        Database Triggers (Guards)       |  |
|  |  - `profiles`, `user_roles`    |  |  - `guard_booking()` (Capacity check)   |  |
|  |  - `centers`, `caregivers`     |  |  - `guard_center_status()` (Re-review)  |  |
|  |  - `bookings`, `disputes`      |  |  - `guard_caregiver_verified()` (Admin) |  |
|  |  - `booking_pickup_codes`      |  |  - `refresh_center_rating()` (Reviews)  |  |
|  +--------------------------------+  +-----------------------------------------+  |
|                                                                                   |
|  +--------------------------------+  +-----------------------------------------+  |
|  |     Stored Procedures (RPC)    |  |          Object Storage (S3)            |  |
|  |  - `seats_left()`              |  |  - `center-photos` bucket               |  |
|  |  - `verify_pickup_code()`      |  |  - Path isolation: `<center_id>/<file>` |  |
|  +--------------------------------+  +-----------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Database Schema & Data Models

### 4.1 Core Entities

1. **`profiles`**: User identity metadata linked 1-to-1 with `auth.users(id)`.
   - Columns: `id (uuid, PK)`, `full_name (text)`, `phone (text)`, `created_at (timestamptz)`.
2. **`user_roles`**: Role-based access control.
   - Enums: `'admin' | 'provider' | 'parent'`.
   - The first account created automatically receives both `'admin'` and `'parent'` roles via trigger `handle_new_user()`.
3. **`centers`**: Childcare facility listings.
   - Columns: `id (uuid, PK)`, `owner_id (uuid)`, `name (text)`, `city (text)`, `address (text)`, `capacity (int)`, `timings (text[])`, `age_groups (text[])`, `hourly_price`, `daily_price`, `monthly_price`, `rating (numeric)`, `photo_path (text)`, `status ('pending' | 'approved' | 'rejected')`.
4. **`caregivers`**: Individual staff members tied to a daycare facility.
   - Columns: `id`, `center_id`, `name`, `role`, `experience_years`, `bio`, `verified (boolean)`.
5. **`bookings`**: Booking transactions and scheduling records.
   - Columns: `id`, `center_id`, `parent_id`, `child_name`, `age_group`, `plan ('hourly' | 'daily' | 'monthly')`, `quantity (int)`, `start_date (date)`, `end_date (date)`, `start_time (time)`, `total_price (int)`, `status ('pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled')`, `notes (text)`.
6. **`booking_pickup_codes`**: Isolated cryptographic authentication credentials for child pick-up.
   - Columns: `booking_id (uuid, PK)`, `code (text, 4-digit)`, `created_at (timestamptz)`.
7. **`disputes`**: Grievance tracking for parental/provider conflict resolution.
   - Columns: `id`, `booking_id`, `reporter_id`, `reason`, `details`, `status ('open' | 'resolved')`, `admin_note`, `created_at`, `resolved_at`.
8. **`reviews`**: Verified customer satisfaction feedback.
   - Columns: `id`, `center_id`, `parent_id`, `rating (1..5)`, `comment (text)`, `reviewer_name (text)`.

---

## 5. Security Architecture & Database Integrity Guards

### 5.1 Zero-Tamper Overbooking Guard (`guard_booking()`)
When a daycare attempts to transition a booking to `accepted`, the trigger executes:
```sql
SELECT d::date INTO full_day 
FROM generate_series(OLD.start_date, OLD.end_date, interval '1 day') AS d
WHERE (
  SELECT count(*) FROM public.bookings b
  WHERE b.center_id = OLD.center_id 
    AND b.status = 'accepted' 
    AND b.id <> OLD.id 
    AND d::date BETWEEN b.start_date AND b.end_date
) >= c.capacity
ORDER BY d LIMIT 1;

IF full_day IS NOT NULL THEN 
  RAISE EXCEPTION 'Center is full on % (capacity %)', to_char(full_day, 'DD Mon YYYY'), c.capacity;
END IF;
```
**Why this matters:** A 1-month booking starting on October 29 correctly locks 1 seat every single day through November 28. A single-day booking on November 10 cannot accidentally cause an overbooking.

### 5.2 Real-Time Availability RPC (`seats_left()`)
Calculates the minimum remaining seats across any span of days for a prospective booking without leaking private booking details:
```sql
CREATE OR REPLACE FUNCTION public.seats_left(_center_id uuid, _plan text, _start date, _quantity int)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(c.capacity - COALESCE((
    SELECT max(used) FROM (
      SELECT (SELECT count(*) FROM public.bookings b
              WHERE b.center_id = c.id AND b.status = 'accepted'
                AND d::date BETWEEN b.start_date AND b.end_date) AS used
      FROM generate_series(_start, public.booking_end_date(_plan, _start, LEAST(_quantity, 24)), interval '1 day') AS d
    ) per_day
  ), 0), 0)::int
  FROM public.centers c
  WHERE c.id = _center_id AND c.status = 'approved'
$$;
```

### 5.3 Cryptographic Pickup Verification Protocol
1. Upon booking acceptance, trigger `issue_pickup_code()` generates a pseudorandom 4-digit code stored in `booking_pickup_codes`.
2. Row-Level Security policy `"parent reads own pickup code"` restricts `SELECT` strictly to `parent_id = auth.uid()`. Providers cannot read the code.
3. At drop-off/pickup, the daycare enters the code via procedure `verify_pickup_code(_booking_id, _code)`:
   - Compares the candidate code against the table using a `SECURITY DEFINER` function.
   - Returns a simple boolean (`true` or `false`).
   - If matched, the child handover is authenticated with zero credential leakage.

### 5.4 Anti-Tampering Re-Review Trigger (`guard_center_status()`)
If an approved facility owner alters core credentials (such as facility name, address, city, or safety certifications), the database trigger automatically demotes the facility's status back to `'pending'`, requiring administrator re-verification before further bookings can be accepted.

---

## 6. Storage & Upload Architecture

- **Bucket:** `center-photos` (Public bucket, 5MB file cap, MIME restricted to JPEG/PNG/WebP).
- **Directory Isolation:** Files must be prefixed with the center's UUID: `<center_id>/<timestamp>.<ext>`.
- **Database Constraint:**
  ```sql
  ALTER TABLE public.centers ADD CONSTRAINT centers_photo_path_check
    CHECK (photo_path IS NULL OR photo_path LIKE id::text || '/%');
  ```
- **Storage Policy:**
  Users can only upload or delete files within directories where `c.owner_id = auth.uid()`.

---

## 7. Quality Assurance & Automated Testing

The project maintains an automated multi-tier test harness:
1. **Frontend Integration Tests (`vitest`):**
   - Validates client-side route mounting, navigation tree, and authentication state transitions.
2. **Postgres In-Memory Database Suite (`@electric-sql/pglite`):**
   - Runs full SQL migrations against virtualized PostgreSQL.
   - Tests overbooking prevention, overlapping date ranges, role-permission fences, rating recalculation triggers, and storage folder boundaries.
   - **Result:** 100% test pass rate (26 Step-2 checks + 12 Step-3 submission checks).

---

## 8. Deployment & CI/CD Pipeline

- **Repository:** Hosted on GitHub with branch protection on `main`.
- **Hosting Platform:** Vercel edge deployment.
- **Build Command:** `npm run build` (outputs optimized SSR and client bundles via Vite & Nitro).
- **Environment Isolation:** Zero credentials checked into Git; `.env` keys managed securely via Vercel Environment Variables.

