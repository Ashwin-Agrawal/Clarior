# Clarior Frontend

React + Vite client for Clarior.

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables
Use `.env`:

```env
VITE_API_URL=https://clarior-backend.onrender.com/api
VITE_RAZORPAY_KEY=your_razorpay_public_key
```

For local backend development:

```env
VITE_API_URL=http://localhost:3002/api
```

## Scripts
- `npm run dev` start dev server
- `npm run build` build production bundle
- `npm run preview` preview production build
- `npm run lint` run ESLint
