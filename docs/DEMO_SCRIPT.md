# 5-Minute Video Demo Script & Presentation Guide
## Little Steps — Trusted 24×7 Childcare Platform

Use this guide to record your project demo video or deliver your live presentation. It takes roughly **4 to 5 minutes** and showcases all core workflows, safety mechanisms, and dashboards.

---

### Demo Accounts to Use (or create fresh)
1. **Admin / Parent Account:** `admin@rentride.com` (Has both Parent and Admin tabs)
2. **Daycare Provider Account:** (In an Incognito window: `daycare@test.com`)

---

## 🎬 Step-by-Step Recording Timeline

### 0:00 – 0:45 | Introduction & Problem Statement
- **Screen:** Home Page (`/`)
- **What to say:**
  > *"Hello everyone! Today I am presenting **Little Steps**, a trusted 24×7 childcare platform built for working parents, shift workers, and modern nuclear families.*
  > *Finding safe childcare in India today is difficult due to unverified staff, lack of 24×7 night options, and zero visibility into real-time seat availability.*
  > *Little Steps bridges this gap with verified crèches, automated overbooking prevention, and digital pickup security."*
- **Action:** Scroll through the home page showcasing the clean design, feature highlights, and the footer linking to Safety, Privacy, Terms, and Refunds.

---

### 0:45 – 1:30 | Parent Discovery & "Seats Left" Engine
- **Screen:** Browse Centers (`/centers`) -> Click any Daycare (e.g. Pune / Sunshine Daycare)
- **What to say:**
  > *"Parents can filter centers by city, 24×7 availability, shifts (day, night, emergency), and age groups.*
  > *On the center detail page, parents can see verified caregiver profiles with blue verification badges, safety measures, certifications, and facility photos.*
  > *Notice our real-time availability engine: when I pick a date and plan, the system calculates exactly how many seats are remaining. If a center is full, the system actively disables requests to protect parents from overbooking."*
- **Action:** Select a date in the booking card; point out the **"X of Y seats free for these dates"** badge. Select a child and click **"Request booking"**.

---

### 1:30 – 2:45 | Daycare Provider Workflow & Overbooking Defense
- **Screen:** Switch to the Incognito window (Daycare Dashboard at `/dashboard`)
- **What to say:**
  > *"Now switching to the Daycare Provider portal. The daycare owner sees their facility listings, revenue metrics, and booking requests.*
  > *Notice our interactive analytics: visual charts tracking monthly earnings and bookings by status.*
  > *When a new request comes in, the provider can accept or reject it. Behind the scenes, a PostgreSQL database trigger checks every single day of the booking—even long multi-week or monthly plans. If capacity is exceeded, the database firmly blocks it."*
- **Action:**
  1. Show the **Earnings per month** and **Bookings by status** charts.
  2. Click **Accept** on the booking.
  3. Show the **"Check PIN"** button.

---

### 2:45 – 3:45 | Security: Secret Pickup PIN & Direct Messaging
- **Screen:** Switch back to the Parent window (My Bookings at `/dashboard`)
- **What to say:**
  > *"Once the booking is accepted, the parent receives a secure **Digital Pickup Pass**.*
  > *This pass contains a cryptographic 4-digit pickup PIN. Only the parent can see this PIN—even the daycare cannot read it in the database.*
  > *At pickup, the daycare enters the PIN using their verification tool to authenticate the parent before handing over the child.*
  > *Parents and daycares can also communicate directly through live in-app messaging, or click 'Report a problem' to file a private grievance with platform admins."*
- **Action:**
  1. Click **"View pass"** to show the 4-digit PIN.
  2. Switch to Daycare window, click **"Check PIN"**, enter the 4 digits, click **"Check"** -> see the green success notification!
  3. Click **"Messages"** to show instant messaging.
  4. Click **"Report a problem"** to show the dispute filing modal.

---

### 3:45 – 4:30 | Platform Administrator Portal
- **Screen:** Admin tab on `/dashboard`
- **What to say:**
  > *"Finally, here is the Platform Admin Portal.*
  > *Admins have complete operational governance. They can review newly registered centers before they go live, verify caregiver certifications, and inspect real-time platform KPIs like:*
  > *- Booking conversion rate*
  > *- Center utilization today*
  > *- Monthly plan adoption %*
  > *- Total platform booking value*
  > *Admins also manage our grievance desk, where parental complaints can be investigated, commented on, and marked resolved."*
- **Action:**
  1. Point to the stat cards at the top.
  2. Show the **Complaints** queue and the **Centers awaiting verification** queue.

---

### 4:30 – 5:00 | Conclusion & Tech Highlights
- **What to say:**
  > *"Little Steps is fully deployed live on Vercel with a Supabase PostgreSQL backend.*
  > *It enforces zero-trust database constraints, DPDP-compliant data privacy, and mobile-first responsive design.*
  > *Thank you for your time!"*

---

### 💡 Pro-Tips for Recording
- **Resolution:** 1080p (Full HD) in 16:9 aspect ratio.
- **Microphone:** Keep voice clear, paced, and confident.
- **Browser:** Close unnecessary tabs; keep one normal browser window (Admin/Parent) and one incognito window (Daycare) ready side-by-side.

