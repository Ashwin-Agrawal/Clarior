# Clarior

Full-stack app with:
- `backend` (Node.js + Express + MongoDB)
- `frontend1` (React + Vite)

## Live deployments
- Frontend: `https://clarior-frontend.vercel.app`
- Backend: `https://clarior-backend.onrender.com`

## Project structure
- `backend/` API server
- `frontend1/` web client
- `render.yaml` Render infrastructure config for backend

## Prerequisites
- Node.js 18+ (or latest LTS)
- npm
- MongoDB connection string

## Local setup

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
```

Update `backend/.env` with real values (`MONGO_URI`, `JWT_SECRET`, Google/Razorpay keys, etc.).

Start backend:
```bash
npm run dev
```

### 2) Frontend
```bash
cd ../frontend1
npm install
cp .env.example .env
```

For local dev backend:
```env
VITE_API_URL=http://localhost:3002/api
```

Start frontend:
```bash
npm run dev
```

## Deployment notes
- **Render backend**: uses `render.yaml` with `rootDir: backend`.
- **Vercel frontend**: set `VITE_API_URL=https://clarior-backend.onrender.com/api`.
- **CORS**: set backend `CORS_ORIGINS` to include:
  - `https://clarior-frontend.vercel.app`
  - `https://www.clarior-frontend.vercel.app` (optional but recommended)

## GitHub push checklist
1. Keep secrets out of git (`.env` ignored, use `.env.example`).
2. From project root (`Clarior`), run:
   ```bash
   git init
   git add .
   git commit -m "Initial project setup"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Add deployment environment variables on Render/Vercel dashboards.

## Common issue: CORS login error
If login fails with preflight CORS error, verify backend `CORS_ORIGINS` includes your Vercel frontend domain exactly.
