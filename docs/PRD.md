# Product Requirements Document (PRD)
## Little Steps — Trusted 24×7 Childcare & Daycare Platform

**Project:** Little Steps  
**Author / Developer:** Vineet Kumar Singh  
**Academic / Organization Context:** Unified Mentor Internship Project  
**Date:** October 30, 2026  
**Status:** Complete & Deployment Ready  
**Live URL:** [https://little-steps-blue.vercel.app](https://little-steps-blue.vercel.app)  
**Repository:** [https://github.com/vineetkrsingh769/Little-Steps](https://github.com/vineetkrsingh769/Little-Steps)  

---

## 1. Executive Summary

With increasing numbers of dual-income families, shift-based jobs (IT/ITES, healthcare, hospitality, aviation), single parents, and nuclear family structures across tier-1 and tier-2 Indian cities, there is an urgent demand for safe, flexible, and round-the-clock childcare solutions. 

Parents routinely struggle to identify trustworthy crèches that offer real-time availability, verified caregivers, transparent pricing, and emergency support. Simultaneously, daycare operators face administrative overhead, poor off-peak utilization, and lack of digital record-keeping.

**Little Steps** is a full-stack digital web platform connecting parents with verified childcare centers and crèches offering 24×7 daycare, hourly emergency care, and monthly subscription plans. The platform incorporates strict safety guards: database-enforced capacity checks preventing overbooking, admin-gated provider approvals, secret pickup authentication PINs, and tamper-proof review tracking.

---

## 2. Problem Statement

Historically, the childcare market in India operates offline with significant pain points:
1. **Opaque Availability:** Parents must make repetitive phone calls to check whether seats are open for a specific date or night shift.
2. **Safety & Verification Deficit:** Lack of centralized background checks or verified credentials for crèche staff and centers.
3. **Inflexible Timings:** Traditional daycares operate strictly on fixed business hours (e.g., 9:00 AM – 6:00 PM), leaving night-shift workers with no viable options.
4. **Arbitrary Pricing:** Pricing structures are rarely public, leading to price variations, hidden fees, or lack of receipts.
5. **Pickup Vulnerability:** Lack of standardized verification protocols during child handover at pickup time.

---

## 3. Product Vision & Objectives

### 3.1 Primary Objectives
- **Trusted 24×7 Access:** Provide a searchable, transparent digital marketplace for crèches and daycares supporting day, night, and emergency shifts.
- **Strict Verification Standards:** Enforce mandatory administrative verification of every daycare and caregiver profile prior to public discovery.
- **Zero-Tamper Capacity Management:** Ensure automated overbooking prevention across hourly, daily, and overlapping multi-week/monthly plans.
- **Child Handover Security:** Introduce cryptographic 4-digit digital pickup codes shared only with parents and verified by providers on arrival.

### 3.2 Secondary Objectives
- **Dynamic Capacity Utilization:** Enable daycare facilities to monetize idle slots during off-peak and night hours.
- **Flexible Plans:** Accommodate hourly drop-offs, multi-day packages, and monthly recurring subscriptions.
- **Community Accountability:** Allow honest, two-way feedback and verifiable reviews strictly from parents with completed bookings.

---

## 4. User Personas & Target Stakeholders

| Persona | Role | Key Needs & Behaviors |
| :--- | :--- | :--- |
| **Priya (Working Mother)** | Parent | Works rotational night shifts in IT; needs certified overnight crèches with verified caregivers, clear pricing, and emergency contact. |
| **Rajesh (Daycare Director)** | Childcare Provider | Manages a center; needs clear visibility into daily occupancy, upcoming booking requests, caregiver profiles, and revenue tracking. |
| **Platform Administrator** | Governance & Admin | Inspects licenses and certifications; verifies caregiver backgrounds; monitors platform disputes, capacity utilization, and system metrics. |

---

## 5. Scope of Work

### 5.1 In-Scope (Phase 1 Deliverables)
- **Responsive Web Application:** Mobile-first user experience built with React and Tailwind CSS.
- **Three Distinct Role Portals:** Dedicated user experiences for Parents, Childcare Providers, and Platform Admins.
- **Discovery & Search Filters:** Filter by city, 24×7 operation, child age group (Infant, Toddler, Preschool), and timing shifts.
- **Booking & Availability Engine:** Real-time seat availability calculation (`seats_left`) and booking request workflow.
- **Handover Security:** Digital Pickup Pass with parent-only secret PIN verified by centers via secure server RPC.
- **Direct Communication:** Real-time in-app messaging between parents and providers per booking.
- **Trust & Reviews:** 1–5 star ratings and reviews unlocked only after a booking is completed.
- **Issue Resolution:** Dedicated "Report a Problem" dispute logging and admin resolution system.
- **Comprehensive Policy Pages:** Integrated Safety Policy, Privacy (DPDP Act aligned), Terms of Service, Refunds, and Contact.

### 5.2 Out-of-Scope (Deferred to Future Releases)
- Native iOS / Android apps (Current system provides full mobile web / PWA compatibility).
- Live CCTV camera streaming feeds (Requires dedicated IoT hardware integration).
- Real-time GPS vehicle tracking for school pickups.

---

## 6. Functional Requirements Matrix

### 6.1 Parent Experience
- **Authentication:** Email & Password registration and Google OAuth sign-in.
- **Center Exploration:** Instant search with live filters for city, 24×7 availability, shifts (day/night/emergency), and age group.
- **Detailed Center Page:** High-resolution photos, caregiver bios with verification badges, safety protocols, certifications, and fee breakdowns.
- **Seat Availability:** Real-time dynamic seat calculation displaying seats remaining for selected dates.
- **Saved Favorites:** One-click heart icon to save favorite centers for quick booking.
- **Child Profiles:** Add child details (name, age group, special medical/dietary notes) to auto-populate bookings.
- **Booking Lifecycle:** Send booking requests, monitor status (`pending`, `accepted`, `rejected`, `completed`, `cancelled`).
- **Digital Pickup Pass:** Access 4-digit secure handover PIN and one-click Google Maps directions.
- **Direct Messaging:** Live chat with daycare coordinators regarding special instructions.

### 6.2 Daycare Provider Experience
- **Center Profile Management:** Create and edit facility profiles, age capacities, pricing tiers (hourly, daily, monthly), safety protocols, and certifications.
- **Facility Photo Upload:** Upload facility images directly to secure Supabase Storage (`center-photos`).
- **Caregiver Roster:** Add staff profiles, experience years, and roles awaiting admin verification.
- **Request Management:** Accept or reject incoming booking requests with automatic capacity validation.
- **Pickup Verification:** Verify parent pickup PINs via numeric keypad dialog without ever seeing the secret PIN directly.
- **Operational Analytics:** Visual chart breakdown of monthly earnings and bookings categorized by status.

### 6.3 Platform Admin Experience
- **Verification Queue:** Review and approve/reject newly registered daycare centers.
- **Caregiver Verification:** Audit and toggle official verification badges for staff.
- **Platform Analytics & KPIs:**
  - Total registered users
  - Verified centers and active providers
  - Overall booking conversion rate (%)
  - Monthly subscription adoption (%)
  - Real-time center utilization today (%)
  - Average platform review rating
  - Total booking volume and revenue
- **Dispute Resolution:** Full grievance management interface to inspect parental complaints, enter resolution notes, and close disputes.

---

## 7. Non-Functional Requirements

- **Overbooking Guarantee:** Overlapping date queries across multi-day and monthly bookings prevent accepting bookings past maximum capacity.
- **Response Times:** Page load times under 2.5 seconds on mobile 4G networks; dynamic seat lookups under 300ms.
- **Data Protection & Privacy:** User data encrypted in transit (TLS 1.3) and at rest (AES-256 via Supabase). Row-Level Security (RLS) ensures zero cross-tenant data leakage.
- **Compliance:** Designed in alignment with India's **Digital Personal Data Protection (DPDP) Act, 2023** (explicit consent, purpose specification, and data deletion mechanisms).

---

## 8. Success Metrics & KPIs

| Metric | Target | How Measured |
| :--- | :--- | :--- |
| **Booking Conversion Rate** | > 65% | Accepted Bookings / Total Requests |
| **Overbooking Incidents** | 0% | Enforced by Postgres database trigger |
| **Caregiver Verification Rate** | 100% | Verified Caregivers / Total Listed |
| **Dispute Resolution Time** | < 24 Hours | Tracked via Admin Disputes Queue |
| **Facility Utilization Rate** | > 70% | Daily Occupied Seats / Total Registered Capacity |

---

## 9. Conclusion

The Little Steps platform successfully digitizes and standardizes childcare discovery, booking, and safety. By pairing consumer-friendly design with strict database constraints, it delivers an internship-winning, production-ready solution that solves real challenges for working families across India.
