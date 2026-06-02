@AGENTS.md

# CLAUDE.md — AI Interview Coach

> This file defines the conventions, architecture rules, and best practices for this project.
> Every contributor (human or AI) must follow these guidelines to maintain a stable, scalable, and maintainable codebase.

---

## 🗂 Project Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 + Shadcn/ui (base-ui primitives) |
| Auth | Auth.js v5 (`next-auth@beta`) — JWT strategy, Credentials provider |
| Database | PostgreSQL via Docker |
| ORM | Prisma 6 |
| Validation | Zod v4 |
| AI — analysis | Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` |
| AI — voice calls | Groq (`llama-3.1-8b-instant`) via `groq-sdk` — low-latency streaming |
| File parsing | `pdf-parse` + `mammoth` (PDF / DOCX → plain text) |

---

## 🏗 As-built File Structure

The project uses a **root-level `app/`** directory (no `src/` wrapper). All shared code lives at the root alongside `app/`.

```
app/
  (auth)/
    layout.tsx                        # Split-panel layout: dark brand panel | form card
    sign-in/page.tsx · _components/SignInForm.tsx
    sign-up/page.tsx · _components/SignUpForm.tsx
  _components/                        # Landing page client components (route-scoped)
    RoleCycler.tsx
    MockInterviewCard.tsx
    AudioCallCard.tsx
    JobAnalysisCard.tsx
  api/
    auth/[...nextauth]/route.ts
    resume/upload/route.ts            # POST — PDF/DOCX/TXT → extract text → db.resume.create
    call/
      transcribe/route.ts             # POST — Groq Whisper STT
      respond/route.ts                # POST — Groq streaming AI response
      report/route.ts                 # POST — Claude post-call report generation
  dashboard/
    layout.tsx                        # RSC — reads session, guards route, renders Sidebar
    page.tsx                          # RSC — welcome header, stats row, feature cards
    _components/Sidebar.tsx           # Client — desktop nav + mobile bar + logout
    analyze/
      page.tsx                        # RSC — fetches user resumes, passes to form
      _components/AnalyzeForm.tsx     # Client — full job analysis form (CV + job details + interviewers)
      [analysisId]/
        page.tsx                      # RSC — fetches analysis record
        _components/AnalysisReport.tsx
    call/
      [analysisId]/
        page.tsx                      # RSC — pre-call briefing
        _components/PreCallBriefing.tsx
      room/[sessionId]/
        page.tsx                      # RSC — live call page
        _components/CallRoom.tsx      # Client — mic, STT, streaming AI, turn management
    report/
      [sessionId]/
        page.tsx                      # RSC — post-call report
        _components/PostCallReport.tsx
  layout.tsx                          # Root layout — Geist font, globals.css
  page.tsx                            # Marketing home page (RSC)

actions/
  authActions.ts                      # signup · login · logout
  analyzeActions.ts                   # analyzeJob — Claude analysis + DB write
  callActions.ts                      # startCall · endCall · saveTurn
  resumeActions.ts                    # deleteResume(resumeId)

lib/
  auth.config.ts                      # Edge-safe auth config
  auth.ts                             # Full auth config (Credentials + Prisma)
  claude.ts                           # Anthropic client singleton
  groq.ts                             # Groq client singleton
  db.ts                               # Prisma client singleton (server-only)
  env.ts                              # Zod-validated ENV wrapper (server-only)
  call-prompt.ts                      # buildInterviewerSystemPrompt · buildConversationMessages · buildPostCallReportPrompt
  validations.ts                      # SignUpSchema · SignInSchema
  utils.ts                            # cn() helper
  types/
    analysis.ts                       # TAnalysis · AnalysisSchema (Zod)
    call.ts                           # TCallReport · CallReportSchema · TConversationTurn

components/
  ui/                                 # Shadcn primitives: Button, Input, Label, Card, PasswordInput
  shared/                             # Composite components (none yet)

prisma/
  schema.prisma                       # Full data model — see Data Models section below
prisma.config.ts                      # Prisma 6 config
proxy.ts                              # Route protection (Next.js 16 middleware replacement)
next.config.ts                        # serverExternalPackages: ['pdf-parse', 'mammoth']
docker-compose.yml                    # PostgreSQL 16 on port 5432
```

---

## 🗺 Feature Roadmap & Status

| Feature | Status | Notes |
|---|---|---|
| Auth (sign-up / sign-in / sign-out) | ✅ Shipped | JWT, bcrypt, server actions |
| Landing page | ✅ Shipped | Hero, features, job analysis, voice sections, how-it-works, CTA |
| Dashboard shell | ✅ Shipped | Sidebar nav, stats row, feature cards |
| Job Analysis | ✅ Shipped | Full Claude analysis with CV + job details context |
| CV / Resume upload | ✅ Shipped | PDF/DOCX/TXT → text extraction → stored per user, multiple supported |
| Voice Mock Interview | ✅ Shipped | Groq STT + streaming AI interviewer + post-call report |
| My Sessions | 🔜 Next | Scaffolded as "Coming soon" in sidebar |
| Settings | 🔜 Next | Scaffolded as "Coming soon" in sidebar |

When building new features: remove `soon: true` from the `NAV` array in `Sidebar.tsx` and create the route under `app/dashboard/[feature-name]/`.

---

## 🐳 Dev Environment

```bash
docker compose up -d   # start PostgreSQL
npm run dev            # start Next.js
```

On Windows: **stop the dev server before running `npx prisma generate`** — the running server locks `query_engine-windows.dll.node` and the generate command will fail with EPERM.

```bash
# After any schema change:
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

Credentials (local only): `postgresql://postgres:postgres@localhost:5432/ai_interview_coach`

Required ENV (see `.env.local.example`):
```
DATABASE_URL
AUTH_SECRET
NEXT_PUBLIC_APP_URL
ANTHROPIC_API_KEY
GROQ_API_KEY          # optional — disables voice feature if absent
```

---

## 🗄 Data Models (Prisma)

```prisma
User
  id, name?, email, password, createdAt, updatedAt
  → analyses     JobAnalysis[]
  → callSessions CallSession[]
  → resumes      Resume[]          # one-to-many, user can have multiple CVs

Resume
  id, userId, fileName, fileSize, rawText (TEXT), uploadedAt
  # rawText holds the full extracted plain-text of the uploaded CV
  # No file storage — only extracted text is kept

JobAnalysis
  id, userId, jobTitle, company, jobDescription
  analysis         Json             # TAnalysis — topics, companyProfile, interviewerProfiles, etc.
  candidateContext String?          # serialised at analysis time: CV text + job details (stage, arrangement, etc.)
  → interviewers   InterviewerProfile[]
  → callSessions   CallSession[]
  createdAt

InterviewerProfile
  id, jobAnalysisId, name, title?, linkedinUrl?

CallSession
  id, userId, analysisId?, status (IN_PROGRESS|COMPLETED|ABANDONED)
  startedAt, endedAt?, isPublic, audioUrl?, consentGiven
  → turns  CallTurn[]
  → report CallReport?

CallTurn
  id, sessionId, role (USER|AI), content, timestamp

CallReport
  id, sessionId (unique), overallScore (0-100), report Json, createdAt
  # report Json = TCallReport: summary, strengths, improvements, frameworksUsed, communicationNotes, recommendedPractice
```

---

## 🤖 AI Architecture

### Two AI providers

| Provider | Used for | Why |
|---|---|---|
| Claude (`claude-sonnet-4-6`) | Job analysis, post-call reports | Deep reasoning, JSON output |
| Groq (`llama-3.1-8b-instant`) | Live interview responses (streaming) | Ultra-low latency for real-time feel |

### Job Analysis flow (`actions/analyzeActions.ts`)

1. User submits: job title, company, job description + optional: selected CV (`resumeId`), job details (stage, arrangement, type, location, notes), interviewers
2. If `resumeId` provided → fetch `resume.rawText` from DB
3. `buildCandidateContext()` → combines CV text + job detail lines into a single context string
4. This context is stored as `JobAnalysis.candidateContext` for later use in calls
5. Claude is called with a structured prompt including the context
6. Response is parsed + validated against `AnalysisSchema` (Zod)
7. `JobAnalysis` record created with `analysis` JSON + `candidateContext`

**Prompt context sections:**
- `CANDIDATE RESUME:` — CV text (up to 3000 chars)
- `JOB DETAILS:` — interview stage, work arrangement, employment type, location, notes

### Voice Call flow

```
CallRoom (client)
  → mic capture → /api/call/transcribe (Groq Whisper STT)
  → POST /api/call/respond  →  Groq streaming  →  ReadableStream
  → TTS playback (browser SpeechSynthesis or similar)
  → saveTurn() server action writes USER + AI turns to DB

On call end:
  → endCall() → status = COMPLETED
  → POST /api/call/report  →  Claude analyses full transcript
  → CallReport created with score + structured feedback
```

**System prompt for calls** (`lib/call-prompt.ts → buildInterviewerSystemPrompt`):
- Persona: first interviewer from analysis (or generic hiring manager)
- Topics, culture signals from `analysis`
- `CANDIDATE BACKGROUND:` section — `candidateContext` from the analysis record (up to 2000 chars)
- Strict rules: <55 words/turn, one question at a time, never break character

### `candidateContext` — the thread that connects features

At analysis time, the user's CV text and job details are combined and stored on `JobAnalysis.candidateContext`. The call respond route reads this field directly — no separate DB query for the resume. This keeps the call route simple and the context consistent between report and call.

---

## 📤 CV / Resume System

- Users upload PDF, DOCX, or TXT files (max 5 MB)
- Server extracts plain text via `pdf-parse` (PDF) or `mammoth` (DOCX)
- Text stored in `Resume.rawText` — no file storage needed
- Multiple CVs per user — all visible in the Job Analysis form
- CV selection happens per-analysis, not globally: user picks (or uploads) a CV each time they run a new analysis
- Delete is per-record with ownership verification

**`next.config.ts` must include:**
```ts
serverExternalPackages: ['pdf-parse', 'mammoth']
```
Without this, webpack tries to bundle these Node.js packages and fails.

---

## 🎨 Visual Design Language

The app uses `bg-zinc-950` as the global dark base. Accent colors signal feature tiers — never mix these:

| Accent | Tailwind prefix | Used for |
|---|---|---|
| Violet | `violet-*` | Core product, primary CTAs, active nav state |
| Teal | `teal-*` | Job/company/HR intelligence, analysis feature |
| Amber | `amber-*` | Premium / Pro tier (voice interview) |
| Emerald | `emerald-*` | Success states, live/online indicators |

**Dashboard** uses `bg-zinc-900` sidebar + `bg-zinc-950` main content area.

Form sections inside the analyze form use `rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6` cards.

---

## 🧩 UI Component Patterns

### Button vs Link

The `Button` component is built on `@base-ui/react/button` and does **not** support `asChild` / Radix `Slot`. Nesting `<Button>` inside `<Link>` produces invalid DOM.

```tsx
// ✅ Navigation — styled <Link>
<Link href="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-8 ...">
  Get started
</Link>

// ✅ Form submits — <Button>
<Button type="submit" size="lg" className="w-full">Sign in</Button>

// ❌ Never
<Link href="/sign-up"><Button>Get started</Button></Link>
```

### Sign-out in client components

```tsx
'use client'
import { logout } from '@/actions/authActions'

<form action={logout}>
  <button type="submit">Sign out</button>
</form>
```

### Non-clickable nav items ("Coming soon")

```tsx
{soon ? (
  <div className="... cursor-not-allowed opacity-40">{inner}</div>
) : (
  <Link href={href} className="...">{inner}</Link>
)}
```

### Inline file upload pattern (used in AnalyzeForm)

Upload happens via `fetch('/api/resume/upload', { method: 'POST', body: formData })` from a client component. The API route extracts text and creates the DB record. The component adds the returned `{ resumeId, fileName, fileSize, uploadedAt }` directly to local state — no page refresh needed.

---

## 🔐 Auth Architecture

Auth.js v5 uses a **split-config** pattern (Edge / Node.js):

- `lib/auth.config.ts` — session strategy, pages, `authorized` callback. No providers, no Prisma. Safe for Edge.
- `lib/auth.ts` — spreads `authConfig` + adds Credentials provider with Prisma lookups.
- `proxy.ts` — imports **only** from `auth.config.ts`.
- `app/api/auth/[...nextauth]/route.ts` — imports from `auth.ts`.

Sign-up is a Server Action (`actions/authActions.ts`) that bcrypt-hashes the password, creates the user, then calls `signIn()`.

---

## 🏢 Casing & Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Routing & feature folders | `kebab-case` | `user-profile/`, `shopping-cart/` |
| React components | `PascalCase` | `SubmitButton.tsx`, `UserProfile.tsx` |
| Custom hooks | `camelCase` prefixed `use` | `useAuth.ts`, `useCartItems.ts` |
| Utility functions | `camelCase` | `formatDate.ts`, `parseQueryString.ts` |
| Server Actions files | `camelCase` suffixed `actions` | `cartActions.ts`, `userActions.ts` |
| TypeScript types/interfaces | `PascalCase` prefixed `T` or `I` | `TUser`, `IApiResponse` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Dynamic route params | Descriptive `kebab-case` | `[userId]`, `[productSlug]` |
| ENV variables (private) | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `AUTH_SECRET` |
| ENV variables (public) | `NEXT_PUBLIC_` prefix | `NEXT_PUBLIC_APP_URL` |

---

## 🚀 Data Fetching & Server Components

- **Default to RSC.** Add `"use client"` only when you need `useState`, `useEffect`, event handlers, or browser APIs.
- **Fetch at the leaf** — each RSC fetches its own data. Next.js deduplicates identical requests.
- **Pass serialisable props** from RSC to Client Components — convert `Date` to ISO string before passing.
- **Server Actions** return typed result objects `{ success: true | false }` — never throw for expected errors.

```ts
// actions pattern
export async function doSomething(formData: FormData): Promise<TResult> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

  const parsed = Schema.safeParse({ ... })
  if (!parsed.success) return { success: false, error: '...', fieldErrors: ... }

  // ... DB logic ...

  return { success: true, id: record.id }
}
```

### Isolation Guardrails

All files that touch DB, auth, or env must start with `import 'server-only'`. This prevents accidental client-side imports.

---

## 🔐 Security & Environment Variables

**Never read `process.env` directly.** Always import through `lib/env.ts`:

```ts
import { env } from '@/lib/env'
env.ANTHROPIC_API_KEY  // typed + validated at startup
```

---

## 📝 TypeScript Discipline

- No `any` — use `unknown` + type guard or Zod parse
- Derive types from Zod schemas: `type TFoo = z.infer<typeof FooSchema>`
- Use `satisfies` for config objects to get type-checking without widening

---

## ⚡ Performance

- `next.config.ts` uses `serverExternalPackages` for heavy Node.js-only packages (`pdf-parse`, `mammoth`)
- Heavy client components can use `dynamic(() => import(...), { ssr: false })` if needed

---

## ⚠️ Quick Reference — Common Mistakes

| ❌ Anti-pattern | ✅ Correct |
|---|---|
| `"use client"` on every component | RSC by default, client only for interactivity |
| Fetch in root layout → prop drilling | Fetch directly in the leaf component |
| Omitting `import 'server-only'` | Required in all DB/auth/env files |
| Reading `process.env.VAR` directly | `import { env } from '@/lib/env'` |
| Native `<img>` / `<a>` tags | `next/image` / `next/link` |
| `throw` in Server Actions for user errors | Typed result `{ success: false, error: '...' }` |
| `any` TypeScript type | `unknown` + type guard or Zod |
| `<Link><Button>` nesting | Styled `<Link>` for nav, `<Button type="submit">` for forms |
| Enabling "Soon" nav item with `href="#"` | Render as `<div>` with `cursor-not-allowed` |
| Mixing accent colors across feature tiers | Violet = core · Teal = analysis · Amber = premium |
| Running `prisma generate` while dev server is up (Windows) | Stop dev server first — DLL is locked |
| Importing `pdf-parse` / `mammoth` without `serverExternalPackages` | Add to `next.config.ts` — webpack can't bundle them |
| Storing uploaded files on disk | Extract text only — store `rawText` in DB |
| Fetching resume in call respond route | Read `analysis.candidateContext` — it's already there |

---

*Last updated: June 2026 — reflects auth · landing · dashboard · job analysis with CV + job details · voice mock interview · post-call reports*
