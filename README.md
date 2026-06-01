# AI Interview Coach

An AI-powered interview preparation platform. Practice mock interviews, get real-time feedback, and track your improvement over time.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Shadcn/ui |
| Auth | Auth.js v5 — email/password (JWT sessions) |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Validation | Zod v4 |

## Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd ai_interview_coach
npm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for session signing — generate with `npx auth secret` |
| `NEXT_PUBLIC_APP_URL` | App base URL (e.g. `http://localhost:3000`) |

### 3. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on `localhost:5432` with:
- User: `postgres`
- Password: `postgres`
- Database: `ai_interview_coach`

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  (auth)/                     # Sign-in and sign-up pages (split-panel layout)
  api/auth/[...nextauth]/     # Auth.js route handler
  layout.tsx
  page.tsx

actions/
  authActions.ts              # Server Actions: signup, login, logout

components/
  ui/                         # Shadcn/ui primitives
  shared/                     # Composite components

lib/
  auth.config.ts              # Edge-safe auth config (proxy.ts uses this)
  auth.ts                     # Full auth config with Credentials provider
  db.ts                       # Prisma client singleton
  env.ts                      # Typed + validated environment variables
  validations.ts              # Zod schemas

prisma/
  schema.prisma               # Database schema
prisma.config.ts              # Prisma 6 configuration

proxy.ts                      # Route protection (Next.js 16 middleware)
docker-compose.yml            # Local PostgreSQL
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma studio` | Open Prisma Studio (DB browser) |
| `docker compose up -d` | Start PostgreSQL in background |
| `docker compose down` | Stop PostgreSQL |

## Authentication Flow

- **Sign up** — `POST /sign-up` → Server Action hashes password with bcrypt, creates user in DB, then signs in automatically
- **Sign in** — `POST /sign-in` → Auth.js Credentials provider verifies password, issues JWT session cookie
- **Route protection** — `proxy.ts` reads the JWT cookie on every request; unauthenticated users are redirected to `/sign-in`
- **Session** — Stateless JWT, 7-day expiry, stored in an `HttpOnly` cookie

## Environment Variables Reference

Create a `.env.local` file at the project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_interview_coach?schema=public"

# Auth — generate with: npx auth secret
AUTH_SECRET=your_secret_here

# Public
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** `.env.local` is gitignored. Never commit secrets.