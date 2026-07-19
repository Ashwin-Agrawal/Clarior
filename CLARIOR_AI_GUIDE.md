# Clarior Codebase & System Guide (For AI Coding Assistants)

This guide provides a comprehensive technical overview of **Clarior**—a 1:1 mentorship and college consultation platform. Use this document to instantly understand the system architecture, database schema, critical flows, design system, and development guidelines.

---

## 1. System Overview & Nationwide Scope
Clarior is a platform designed to connect college aspirants/students with verified college seniors ("Insiders") for anonymous, secure, 1:1 video/audio consultation calls.
* **Scope**: Unlike elite-only directories, Clarior is designed for **all colleges all over India**. It maps national institutes, regional government colleges, private state universities, and local institutions.
* **Duration**: Exactly **20 minutes** per session.
* **Pricing**: Flat **₹69** per call (purchased as credits by students).
* **Privacy**: 100% Anonymous connection. Calls are conducted natively inside the app; no personal contact details (email/phone) are shared between student and senior.

---

## 2. All-India College Directory Architecture & Seeding

To support every student in India, the platform features a democratized, expandable college registry instead of a hardcoded list of elite schools.

### A. Directory Categories & Seeding History:
1. **National Institutes**: IITs, NITs, IIITs, BITS, etc.
2. **Regional Government Colleges**: Seeded registries containing state institutions across regions like Delhi-NCR, Haryana, and West Bengal (e.g. 37 unique West Bengal colleges, 27 Delhi/Haryana government colleges).
3. **New-Gen & Private Institutions**: Seeded with location-appended names (e.g., "Amity University, Noida" or "LPU, Jalandhar") to avoid duplicate names and help students distinguish campuses.
4. **Worldwide Scope Expansion**: The copy and metadata are configured to support "top colleges worldwide", allowing international or NRI applicants to check in-state registries.

### B. Dynamic Expansion (`CollegeRequest` System):
If an aspirant's target college is not in the directory:
1. The student submits a request via the `RequestCollegeModal` on the frontend.
2. This creates a `CollegeRequest` document containing the requested college name, location, and the requester's email.
3. Admins review pending requests inside `AdminDashboard.jsx` and can approve and seed them into the main `College` collection, making them instantly available for new seniors to register under.

---

## 3. Database Architecture (Mongoose Models)

### `User` (`backend/src/models/User.js`)
* **Roles**: `student`, `senior`, `admin`.
* **Verification**: `isVerified` (boolean, indicates senior approval status), `applicationStatus` (`none`, `pending`, `approved`, `rejected`).
* **Financial Tokens**:
  * `callCredits` (Number): Balance of call credits owned by students.
  * `availableBalance` (Number): Withdrawable earnings (INR) owned by seniors.
  * `pendingEarnings` (Number): Escrow balance for completed calls awaiting admin release.

### `Slots` (`backend/src/models/Slots.js`)
* Represent a senior's availability window.
* Fields: `senior` (ObjectId -> User), `date` (Date), `time` (String range, e.g., "18:00-18:20"), `isBooked` (Boolean).
* Expired, unbooked slots are cleaned up daily at midnight via a cron job.

### `Booking` (`backend/src/models/Booking.js`)
* Connects the student, senior, and slot.
* Fields: `student`, `senior`, `slot`, `status` (`confirmed`, `completed`, `cancelled`), `startTime`, `endTime`, `meetLink`.
* Earnings Release status: `isSeniorMarkedDone` (Boolean), `isEarningsReleased` (Boolean).

### `Review` (`backend/src/models/Review.js`)
* Tied to a booking. Students review seniors post-call.
* Fields: `student`, `senior`, `booking`, `rating` (1–5), `comment`.

### `CollegeRequest` (`backend/src/models/CollegeRequest.js`)
* Schema: `name` (String), `location` (String), `requesterEmail` (String), `status` (`pending`, `approved`, `rejected`).

### `SupportTicket` (`backend/src/models/SupportTicket.js`)
* Tracks user support inquiries submitted via the contact dashboard.

---

## 4. Critical Workflows & Business Logic

### A. Atomic Slot Locking (Race Condition Prevention)
To prevent two students from booking the same slot at the same time, the booking service uses a Mongoose transaction to atomically find and lock the slot:
```js
const slot = await Slot.findOneAndUpdate(
  { _id: slotId, isBooked: false },
  { $set: { isBooked: true } },
  { new: true, session }
);
if (!slot) throw new Error('SLOT_ALREADY_BOOKED');
```

### B. In-App Jitsi Call Flow
* Calls run in an iframe using the Jitsi API on the `/session/:bookingId` page.
* **Join Restrictions**: Users can only join the call lobby **5 minutes before** the scheduled start time.
* **Completion**: Once a session completes or is marked done, the Jitsi frame hides immediately to protect privacy.
* **Earnings Payout**: When marked done, call payout amounts are atomically added to `pendingEarnings` of the senior.

### C. Admin Earnings Release
Admins review completed calls and release the payout atomically from `pendingEarnings` to `availableBalance`:
```js
const updated = await User.findOneAndUpdate(
  { _id: seniorId, pendingEarnings: { $gte: payout } },
  { $inc: { pendingEarnings: -payout, availableBalance: payout } },
  { new: true }
);
```

### D. Senior Application & Profile Rules
* Seniors must provide a valid UPI ID (validated via `/^[\w.]+@[\w]+$/` regex) and college.
* Once a senior is **verified**, they are blocked from modifying their verified LinkedIn URL or re-submitting application forms to prevent profile fraud.

---

## 5. Design System & Theme Variables (`index.css`)

Clarior uses CSS variables for theme support instead of hardcoded Tailwind color utilities to allow toggling light/dark modes using the `html.dark` class.

### Key CSS Variables:
* Background: `var(--bg)` / Tailwind class `bg-bg`
* Surfaces: `var(--surface)` / class `bg-surface` (white in light mode, deep blue in dark mode)
* Borders: `var(--border)` / class `border-border`
* Text Color: `var(--fg)` / class `text-fg` (dark navy in light, light ice-blue in dark)
* Muted Text: `var(--muted)` / class `text-muted`

**Rule for UI Edits**: Always prefer using theme variables (e.g. `bg-surface`, `border-border`, `text-fg`) over static Tailwind classes like `bg-white` or `bg-slate-900` to ensure automatic, clean dark/light mode switching.

---

## 6. Development Rules & Guidelines

1. **Keep Changes Local ("dont push")**:
   * Under no circumstances should you run `git push` directly to the remote repository. Keep all modifications, branches, and commits local.
2. **20-Minute Session Constancy**:
   * Session slots and countdown timers are strictly 20 minutes across all views.
3. **Preserve Codebase Integrity**:
   * Do not delete or rename existing utility controllers unless explicitly requested. Preserve all existing comments and audit validations.
