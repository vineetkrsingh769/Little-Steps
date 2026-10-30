# Little Steps — Trusted 24×7 Childcare & Daycare Platform

[![Live Platform](https://img.shields.io/badge/Live%20Platform-Vercel%20Deployed-success?style=for-the-badge&logo=vercel)](https://little-steps-blue.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Built%20With-TanStack%20Start%20%2B%20Supabase-blue?style=for-the-badge)](https://little-steps-blue.vercel.app)
[![License](https://img.shields.io/badge/Project-Unified%20Mentor%20Internship-orange?style=for-the-badge)](#)

> **Little Steps** is a full-stack digital web platform connecting parents with verified childcare centers and crèches offering 24×7 daycare, emergency hourly drop-offs, and monthly subscription plans. The platform guarantees child safety with database-enforced capacity limits, mandatory admin verification, secret digital pickup authentication PINs, and real-time availability tracking.

- **🌐 Live Production URL:** [https://little-steps-blue.vercel.app](https://little-steps-blue.vercel.app)
- **📂 GitHub Repository:** [https://github.com/vineetkrsingh769/Little-Steps](https://github.com/vineetkrsingh769/Little-Steps)
- **📄 Product Requirements Document (PRD):** [`docs/PRD.md`](docs/PRD.md)
- **🛠️ Technical Architecture Guide:** [`docs/Technical-Documentation.md`](docs/Technical-Documentation.md)
- **🎬 5-Minute Video Demo Script:** [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

---

## 🌟 Key Platform Features

### 1. 👨‍👩‍👧 For Parents
- **24×7 Daycare Discovery:** Instant search and filters by city, 24×7 night availability, shift types (day/night/emergency), and child age group (Infant, Toddler, Preschool).
- **Real-Time "Seats Left" Counter:** Live availability algorithm (`seats_left`) calculates remaining seats for any selected dates and plan; blocks requests when full.
- **Detailed Center Profiles:** High-resolution photos, verified caregiver bios with credentials, safety protocols, certifications, and transparent pricing.
- **Digital Pickup Pass & Secret PIN:** Cryptographic 4-digit pickup code visible only to the parent; verified securely by the daycare on arrival.
- **Saved Favorites & Child Profiles:** Manage children profiles (allergies, special care notes) to automatically auto-fill booking requests.
- **Direct Messaging & Grievances:** In-app live chat with the daycare coordinator and a private "Report a problem" grievance desk.
- **Honest Reviews:** Verified 1–5 star reviews unlocked strictly after a booking has been completed.

### 2. 🏫 For Childcare Providers
- **Center & Capacity Management:** Add and update center facilities, daily capacity limits, pricing tiers (hourly, daily, monthly), and safety rules.
- **Facility Photo Upload:** Upload facility photos directly to secure cloud storage (`center-photos`).
- **Caregiver Roster:** Add staff bios and experience years awaiting admin verification.
- **Booking Request Workflow:** Accept or reject booking requests with automatic database-level capacity validation.
- **Secure Pickup Verification:** Built-in PIN verification tool validates the parent's secret pass without exposing the code.
- **Operational Analytics:** Interactive chart visualizations of monthly revenue and bookings grouped by status.

### 3. 🛡️ For Platform Administrators
- **Center Approval Queue:** Review newly registered daycares before they can receive bookings.
- **Caregiver Badge Verification:** Verify staff credentials and toggle verified checkmarks.
- **Platform Analytics & KPIs:**
  - Real-time facility utilization today (%)
  - Booking conversion rate (%)
  - Monthly subscription adoption rate (%)
  - Average platform rating
  - Total registered users and gross booking revenue
- **Grievance Resolution Desk:** Review parental dispute reports, record resolution notes, and resolve complaints.

---

## 🔒 Security Architecture & Database Integrity Guards

Little Steps enforces critical business and safety rules at the PostgreSQL database engine level (never trusting client inputs):
1. **Mathematical Overbooking Prevention (`guard_booking`):** Automatically computes overlapping daily, hourly, and multi-week monthly plans. Refuses bookings when any day in the requested span exceeds maximum facility capacity.
2. **Secret Pickup Verification (`verify_pickup_code`):** Codes are generated via cryptographic random triggers and stored in an isolated table restricted by Row-Level Security (RLS). Only parents can read them; providers can only test match validity.
3. **Anti-Tampering Re-Review (`guard_center_status`):** If an approved center changes sensitive details (name, city, address, or certifications), the database immediately demotes it back to `pending` status for admin re-audit.
4. **Data Protection Compliance:** Designed in compliance with India's **Digital Personal Data Protection (DPDP) Act, 2023** with explicit consent and purpose specification.

---

## 💻 Tech Stack & Architecture

- **Frontend & Server Engine:** [TanStack Start](https://tanstack.com/start) (React 19, Vite, Nitro server)
- **Styling:** Tailwind CSS + Radix UI Primitives
- **State & Server Cache:** TanStack React Query v5
- **Charts & Visualizations:** Recharts (`src/components/dashboard/ProviderCharts.tsx`)
- **Backend & Database:** [Supabase](https://supabase.com) (PostgreSQL 15 with Row-Level Security, Functions & Triggers)
- **Cloud Storage:** Supabase Storage (`center-photos` bucket)
- **Deployment:** [Vercel](https://vercel.com) Edge Platform

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 20+ installed
- A free [Supabase](https://supabase.com) project

### 2. Installation
```sh
git clone https://github.com/vineetkrsingh769/Little-Steps.git
cd Little-Steps
npm install
```

### 3. Configure Database
In your Supabase project's **SQL Editor**, run the migration files in order:
1. `supabase/migrations/20261020000000_little_steps_schema.sql`
2. `supabase/migrations/20261020000001_children_reviews_favorites_messages.sql`
3. `supabase/migrations/20261020000002_grant_new_tables.sql`
4. `supabase/migrations/20261029000000_step2_fixes.sql`
5. `supabase/migrations/20261030000000_submission_features.sql`
6. `supabase/seed.sql` (Loads the 20 pre-configured demo daycares across Bengaluru, Mumbai, Pune, and Delhi).

### 4. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

### 5. Start Application
```sh
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note on Roles:** The very first account registered automatically receives the **Administrator** role along with Parent privileges. Subsequent accounts register as Parents or Childcare Providers.

---

## 🧪 Testing & Verification

Run the automated integration and unit test suite:
```sh
npm test
```
Typecheck verification:
```sh
npx tsc --noEmit
```
Production build verification:
```sh
npm run build
```

---

## 📑 Project Submission Deliverables (Unified Mentor)

All project deliverables required by the Unified Mentor internship brief have been compiled and organized:

| Deliverable | Location / Link | Description |
| :--- | :--- | :--- |
| **Live Deployed App** | [little-steps-blue.vercel.app](https://little-steps-blue.vercel.app) | Production deployment hosted on Vercel |
| **Source Code** | [GitHub Repository](https://github.com/vineetkrsingh769/Little-Steps) | Clean Git repository without third-party boilerplate |
| **Product Requirements (PRD)** | [`docs/PRD.md`](docs/PRD.md) & [`docs/PRD.html`](docs/PRD.html) | Formal requirements, user flows, personas, and KPI matrix |
| **Technical Documentation** | [`docs/Technical-Documentation.md`](docs/Technical-Documentation.md) | Architectural blueprints, ER schema, triggers, and security |
| **Demo Recording Script** | [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | Structured 5-minute click-by-click video presentation guide |
