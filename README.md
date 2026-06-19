# Clarior

Clarior is a full-stack mentorship platform that connects students with verified seniors from colleges. Students can explore colleges and mentors, buy call credits, book sessions, join calls, and review mentors. Seniors can apply for verification, manage availability, complete sessions, and request payouts. Admins can verify seniors, manage users, handle college requests, support tickets, credits, and earning releases.

## Contents

- [Live App](#live-app)
- [What Clarior Does](#what-clarior-does)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Core Roles](#core-roles)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Frontend Routes](#frontend-routes)
- [Backend API Map](#backend-api-map)
- [Data Models](#data-models)
- [Security Notes](#security-notes)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Production Checklist](#production-checklist)

## Live App

| Service | URL |
| --- | --- |
| Website | `https://clarior.in` |
| Frontend deployment | `https://clarior-frontend.vercel.app` |
| Backend | `https://clarior-backend.onrender.com` |
| Backend health | `https://clarior-backend.onrender.com/` |

## What Clarior Does

Clarior is built around a guided student-to-senior mentorship flow:

1. Students register or log in.
2. Students browse verified seniors and colleges.
3. Students buy credits through Razorpay.
4. Students book available senior slots.
5. Students and seniors join a session using the booking session page.
6. Seniors mark sessions complete.
7. Students confirm completion.
8. Earnings move through pending release, admin release, and senior withdrawal flows.

The platform also includes college request handling, Google Calendar support, reviews, support tickets, admin tooling, protected routes, role-based access, and production-oriented security middleware.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, HTTP-only cookie flow, role middleware |
| Payments | Razorpay |
| Calendar | Google OAuth / Google Calendar APIs |
| Email | Nodemailer |
| Security | Helmet, CORS allowlist, rate limiting, validation middleware |
| Deployment | Vercel frontend, Render backend |

## Repository Structure

```text
Clarior/
+-- backend/                  # Express API server
|   +-- server.js             # Server bootstrap, DB connect, cron, admin seed
|   +-- src/
|   |   +-- app.js            # Express app, middleware, routes, security config
|   |   +-- controllers/      # Request handlers
|   |   +-- db/               # MongoDB connection
|   |   +-- middleware/       # Auth, role, validation, error handling
|   |   +-- models/           # Mongoose schemas
|   |   +-- routes/           # API route definitions
|   |   +-- services/         # Business/service helpers
|   |   +-- utils/            # Cron jobs, seeders, Google client, responses
|   +-- .env.example
+-- frontend1/                # React + Vite client
|   +-- src/
|   |   +-- components/       # Shared UI, shell, auth route guards
|   |   +-- context/          # Auth, theme, toast state
|   |   +-- hooks/            # SEO helper
|   |   +-- pages/            # App screens
|   |   +-- services/         # API and Razorpay clients
|   |   +-- styles/           # Global styles and dark-mode fixes
|   +-- public/               # Static web assets
|   +-- .env.example
+-- render.yaml               # Render backend deployment config
+-- DEPLOYMENT_GUIDE.md
+-- PRODUCTION_CHECKLIST.md
+-- SECURITY.md
+-- SECURITY_AUDIT_REPORT.md
```

## Core Roles

| Role | Main Capabilities |
| --- | --- |
| Student | Browse mentors, buy credits, book sessions, join calls, confirm completion, review seniors |
| Senior | Apply for mentor status, submit verification details, manage availability, join calls, mark sessions complete, request withdrawals |
| Admin | Verify seniors, manage users, grant credits, handle earning releases, approve/reject withdrawals, manage college requests and support tickets |

## Local Development

### Prerequisites

- Node.js 18+ for the monorepo
- Node.js 20.x is recommended for the frontend because `frontend1/package.json` declares `node: 20.x`
- npm
- MongoDB connection string
- Razorpay test keys if testing payments
- Google OAuth credentials if testing Google Calendar integration

### 1. Install dependencies

From the project root:

```bash
npm install
```

You can also install each workspace independently:

```bash
cd backend
npm install

cd ../frontend1
npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your real values:

```env
NODE_ENV=development
PORT=3002
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clarior
JWT_SECRET=replace_with_a_strong_random_secret
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
CORS_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3002/api/google/callback
GOOGLE_CALENDAR_ID=primary
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
PAYOUT_AMOUNT=52
```

Start the backend:

```bash
npm run dev
```

The API should respond at:

```text
http://localhost:3002/
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend1
cp .env.example .env
```

For local development, use:

```env
VITE_API_URL=http://localhost:3002/api
VITE_RAZORPAY_KEY=your_razorpay_public_key
```

Start the frontend:

```bash
npm run dev
```

The Vite app usually runs at:

```text
http://localhost:5173
```

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | Backend port, defaults to `3002` in code |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `ADMIN_NAME` | Yes | Seeded admin display name |
| `ADMIN_EMAIL` | Yes | Seeded admin login email |
| `ADMIN_PASSWORD` | Yes | Seeded admin login password |
| `CORS_ORIGINS` | Yes | Comma-separated frontend origins |
| `GOOGLE_CLIENT_ID` | For Google | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Google | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | For Google | OAuth callback URL |
| `GOOGLE_CALENDAR_ID` | For Google | Calendar ID, usually `primary` |
| `RAZORPAY_KEY` | For payments | Razorpay key ID |
| `RAZORPAY_SECRET` | For payments | Razorpay secret |
| `PAYOUT_AMOUNT` | For payouts | Per-session payout amount in INR |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend API base URL, for example `http://localhost:3002/api` |
| `VITE_RAZORPAY_KEY` | For payments | Razorpay public key, safe to expose in the browser |

## Available Scripts

### Root

| Command | Description |
| --- | --- |
| `npm run build` | Build the frontend workspace |
| `npm run install:frontend` | Install frontend dependencies |
| `npm run start:backend` | Start the backend workspace |

### Backend

Run from `backend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start Express with Nodemon |
| `npm start` | Start Express with Node |
| `npm run seed:colleges` | Seed college data |
| `npm test` | Placeholder test script; currently exits with an error |

### Frontend

Run from `frontend1/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build production assets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Frontend Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Home page |
| `/explore` | Public | Browse mentors and colleges |
| `/college/:id` | Public | College profile |
| `/profile/:id` | Public | Senior profile |
| `/buy-credits` | Public route in app | Buy call credits |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/mentor-guidelines` | Public | Mentor guidelines |
| `/how-it-works` | Public | Platform guide |
| `/contact` | Public | Contact/support entry |
| `/about` | Public | About page |
| `/privacy` | Public | Privacy policy |
| `/terms` | Public | Terms |
| `/become-mentor` | Authenticated | Senior application flow |
| `/become-senior` | Authenticated | Alias for senior application flow |
| `/dashboard` | Authenticated | User dashboard |
| `/bookings` | Student/Senior | Booking list |
| `/session/:bookingId` | Student/Senior | Session room |
| `/availability` | Senior | Manage availability slots |
| `/verify` | Senior | Submit verification details |
| `/admin` | Admin | Admin dashboard |

## Backend API Map

Base path:

```text
/api
```

### Auth

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create account |
| `POST` | `/auth/login` | Public | Log in |
| `GET` | `/auth/logout` | Public | Log out |
| `GET` | `/auth/google-config` | Public | Get Google client config |
| `POST` | `/auth/google` | Public | Google login |

### Users and Seniors

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/users/seniors` | Public | List verified seniors |
| `GET` | `/users/seniors/:id` | Public | Get senior profile |
| `GET` | `/users/me` | Authenticated | Get current user |
| `GET` | `/users/me/requests` | Authenticated | Get user's requests |
| `PATCH` | `/users/profile` | Authenticated | Update profile |
| `PATCH` | `/users/upi` | Authenticated | Update UPI ID |
| `POST` | `/users/apply-senior` | Authenticated | Apply to become senior |
| `POST` | `/users/become-senior` | Authenticated | Alias for senior application |
| `PATCH` | `/users/verification-details` | Senior | Update senior verification details |

### Colleges

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/colleges/stats` | Public | Global platform stats |
| `POST` | `/colleges/request` | Public | Request a college to be added |
| `GET` | `/colleges` | Public | List/search colleges |
| `GET` | `/colleges/:id` | Public | College profile and seniors |
| `GET` | `/colleges/admin/requests` | Admin | List college requests |
| `PATCH` | `/colleges/admin/requests/:requestId/approve` | Admin | Approve college request |
| `PATCH` | `/colleges/admin/requests/:requestId/reject` | Admin | Reject college request |

### Slots

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/slots` | Public | Get available slots |
| `GET` | `/slots/senior/:id` | Public | Get slots for one senior |
| `POST` | `/slots` | Senior | Create a slot |
| `POST` | `/slots/bulk` | Senior | Create slots in bulk |
| `DELETE` | `/slots/:id` | Senior | Delete a slot |

### Bookings

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/bookings` | Student | Create booking |
| `GET` | `/bookings/my` | Authenticated | Get current user's bookings |
| `GET` | `/bookings/:id` | Authenticated | Get booking by ID |
| `DELETE` | `/bookings/:bookingId` | Authenticated | Cancel booking |
| `PATCH` | `/bookings/start/:bookingId` | Student/Senior | Mark participant as started |
| `PATCH` | `/bookings/meet-link/:bookingId` | Senior | Set meeting link |
| `PATCH` | `/bookings/senior-complete/:bookingId` | Senior | Mark session complete |
| `PATCH` | `/bookings/student-confirm/:bookingId` | Student | Confirm completed session |

### Payments

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/payment/create-order` | Authenticated | Create Razorpay order |
| `POST` | `/payment/verify` | Authenticated | Verify Razorpay payment |

### Reviews

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/reviews` | Authenticated | Add review |
| `GET` | `/reviews/:seniorId` | Public | Get senior reviews |
| `DELETE` | `/reviews/:reviewId` | Authenticated | Delete review |

### Withdrawals

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/withdraw/request` | Senior | Request withdrawal |
| `GET` | `/withdraw/pending` | Admin | List pending withdrawals |
| `PATCH` | `/withdraw/approve/:id` | Admin | Approve withdrawal |
| `PATCH` | `/withdraw/reject/:id` | Admin | Reject withdrawal |

### Admin

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/admin/users` | Admin | List users |
| `GET` | `/admin/pending-seniors` | Admin | List senior applications |
| `PATCH` | `/admin/verify/:userId` | Admin | Verify senior |
| `DELETE` | `/admin/user/:userId` | Admin | Delete user |
| `POST` | `/admin/grant-credits/:userId` | Admin | Grant call credits |
| `POST` | `/admin/test/fast-forward-booking/:bookingId` | Admin | Test helper for booking lifecycle |
| `GET` | `/admin/pending-releases` | Admin | List pending earning releases |
| `PATCH` | `/admin/release-earnings/:bookingId` | Admin | Release senior earnings |
| `PATCH` | `/admin/reject-earnings/:bookingId` | Admin | Reject earning release |

### Google Calendar

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/google/auth-url` | Admin | Get OAuth connection URL |
| `GET` | `/google/callback` | OAuth callback | Handle OAuth callback |
| `GET` | `/google/status` | Admin | Check Google connection status |

### Support

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/support` | Public | Create support ticket |
| `GET` | `/support/admin/tickets` | Admin | List support tickets |
| `PATCH` | `/support/admin/tickets/:ticketId/resolve` | Admin | Resolve support ticket |

## Data Models

Main MongoDB collections:

| Model | Purpose |
| --- | --- |
| `User` | Students, seniors, admins, verification, credits, earnings, payment IDs |
| `College` | College data shown in explore/profile flows |
| `CollegeRequest` | User-submitted college requests |
| `Slot` | Senior availability with date, time, booking state |
| `Booking` | Student-senior session lifecycle |
| `Review` | Senior ratings and comments |
| `Withdraw` | Senior withdrawal requests |
| `SupportTicket` | Contact/support tickets |
| `GoogleToken` | Google OAuth token storage |

## Security Notes

The backend includes several production-minded protections:

- CORS allowlist via `CORS_ORIGINS`, with localhost allowances in development.
- `helmet` security headers.
- Custom CSP allowing Razorpay, Google, and Jitsi integrations.
- Express rate limiting globally.
- Stricter rate limits for auth and payment endpoints.
- Request body size limits.
- JWT auth middleware.
- Role-based route authorization.
- Validation middleware for login and registration.
- Centralized error handling.
- Secrets are expected to live in `.env` files or deployment dashboards, not in git.

## Deployment

### Backend on Render

The root `render.yaml` deploys the backend as a Render web service:

```yaml
rootDir: backend
buildCommand: npm install
startCommand: npm start
```

Set these environment variables in Render:

```text
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
ADMIN_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
GOOGLE_CALENDAR_ID=...
CORS_ORIGINS=https://clarior.in,https://www.clarior.in,https://clarior-frontend.vercel.app
RAZORPAY_KEY=...
RAZORPAY_SECRET=...
PAYOUT_AMOUNT=52
```

### Frontend on Vercel

Use `frontend1` as the project root.

Recommended settings:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

Set frontend environment variables:

```text
VITE_API_URL=https://clarior-backend.onrender.com/api
VITE_RAZORPAY_KEY=...
```

## Troubleshooting

### Backend fails with missing MongoDB error

Add `MONGO_URI` to `backend/.env` locally or to the Render environment variables in production.

### Login fails with CORS or preflight error

Make sure `CORS_ORIGINS` contains the exact frontend origin. Do not include paths. Avoid trailing slashes.

Good:

```text
https://clarior.in
```

Bad:

```text
https://clarior.in/
https://clarior.in/login
```

### Frontend calls the wrong backend

Check `frontend1/.env`:

```env
VITE_API_URL=http://localhost:3002/api
```

Restart the Vite dev server after changing `.env`.

### Payments do not open or verify

Check both sides:

- `frontend1/.env` has `VITE_RAZORPAY_KEY`.
- `backend/.env` has `RAZORPAY_KEY` and `RAZORPAY_SECRET`.
- The logged-in user has a valid session cookie.
- The backend `/api/payment/create-order` endpoint is reachable.

### Admin cannot access dashboard

Confirm that the seeded admin exists and that `ADMIN_EMAIL` / `ADMIN_PASSWORD` are set before backend startup. The server calls the admin seed helper during startup.

### Google Calendar connect fails

Verify:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_CALENDAR_ID`
- Google Cloud OAuth redirect URI matches the deployed callback exactly.

## Production Checklist

Before going live:

- Use a strong `JWT_SECRET`.
- Store all secrets in Render/Vercel dashboards.
- Set `NODE_ENV=production` on the backend.
- Confirm `CORS_ORIGINS` includes every production frontend domain.
- Confirm Razorpay keys match the intended test/live mode.
- Confirm Google OAuth redirect URIs for production.
- Run `npm run build` inside `frontend1`.
- Run `npm run lint` inside `frontend1`.
- Confirm `https://clarior-backend.onrender.com/` returns the health response.
- Review `SECURITY.md`, `SECURITY_AUDIT_REPORT.md`, `DEPLOYMENT_GUIDE.md`, and `PRODUCTION_CHECKLIST.md`.

## Notes for Contributors

- Keep `.env` files out of git.
- Update `.env.example` whenever a new environment variable is introduced.
- Keep route definitions and this README in sync when API endpoints change.
- Prefer small, focused changes with a clear test or verification path.
- Avoid committing generated build output unless deployment specifically requires it.
