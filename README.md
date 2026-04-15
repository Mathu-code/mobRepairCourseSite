# MobRepair Course Site

A full-stack course and notes marketplace for mobile repair learning. The platform supports role-based workflows for students, instructors, and admins, including content uploads, protected routes, enrollments, and Stripe-powered checkout.

## Features

- Course and notes marketplace experiences
- Student, instructor, and admin dashboards
- Authentication and protected routes
- Course and notes upload pipelines
- Media delivery for thumbnails, videos, notes, and avatars
- Stripe payment integration
- MongoDB persistence with Mongoose

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- React Router

### Backend

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT auth middleware
- Multer-based uploads
- Stripe server integration

## Project Structure

```text
mobRepairCourseSite/
  components/          # Reusable UI and domain components
  context/             # React context providers
  hooks/               # Custom hooks
  lib/                 # Frontend API helpers
  pages/               # Route-level pages
  server/              # Express backend (TypeScript)
  styles/              # Global styles
  public/              # Static assets
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local instance or cloud URI)
- Stripe account (test keys for development)

## Environment Setup

### Frontend env

Create `.env` in the project root (or copy from `.env.example`):

```bash
cp .env.example .env
```

Variables:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
# Optional. Defaults to http(s)://<host>:5000 when not set.
VITE_API_BASE=http://127.0.0.1:5000
```

### Backend env

Create `server/.env` (or copy from `server/.env.example`):

```bash
cp server/.env.example server/.env
```

Recommended variables:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/mobrepairhouse

JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRY=7d

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=104857600
```

## Installation

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

## Run Locally

Use two terminals.

### Terminal 1: backend

```bash
cd server
npm run dev
```

Server runs at `http://localhost:5000` by default.

### Terminal 2: frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

## Available Scripts

### Root (frontend)

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check and build frontend
- `npm run preview` - Preview production frontend build
- `npm run lint` - Run ESLint

### Server

- `npm run dev` - Start backend in watch mode with tsx
- `npm run build` - Compile backend TypeScript
- `npm run start` - Run compiled backend from `dist`
- `npm run seed` - Seed sample data

## API and Health Check

- Base API path: `/api`
- Health endpoint: `GET /api/health`

## Deployment Notes

- Set production-safe `JWT_SECRET`, database URI, and Stripe keys.
- Restrict `CORS_ORIGINS` to trusted frontend domains.
- Persist and secure `UPLOAD_PATH` for user content.
- Build frontend and backend separately in CI/CD.

## Security Notes

- Never commit real secrets in `.env` files.
- Use test Stripe keys for local development.
- Rotate exposed keys immediately if leaked.

## License

This project is for educational use unless otherwise specified by the repository owner.
